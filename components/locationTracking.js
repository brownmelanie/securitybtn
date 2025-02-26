import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import Constants from 'expo-constants';

const LOCATION_TRACKING_TASK = 'alert-location-tracking';
const apiUrl = Constants.expoConfig.extra.apiUrl;

let locationUpdateInterval = null;

const sendLocationUpdate = async (alertId, latitude, longitude) => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('No se encontró el token de acceso');
    }

    const response = await fetch(`${apiUrl}/events/${alertId}/location`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        location: { latitude, longitude }
      }),
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 400) {
        await stopLocationTracking();
        Alert.alert('Alerta finalizada', 'El servidor ha cerrado la alerta. Se detiene el seguimiento de ubicación.');
        return false;
      }
      throw new Error(`Error del servidor: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error al enviar la ubicación:', error);
    return false;
  }
};

TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }) => {
  try {
    if (error) {
      console.error('Error en el seguimiento de ubicación:', error);
      return;
    }
    if (data) {
      const { locations } = data;
      if (locations && locations.length > 0) {
        const location = locations[0];
        const storedAlertId = await AsyncStorage.getItem('currentAlertId');
        const alertId = storedAlertId ? parseInt(storedAlertId, 10) : null;
        if (location && alertId) {
          const { latitude, longitude } = location.coords;
          const success = await sendLocationUpdate(alertId, latitude, longitude);
          if (!success) {
            await stopLocationTracking();
          }
        }
      }
    }
  } catch (err) {
    console.error('Excepción en TaskManager.defineTask:', err);
  }
});

export const startLocationTracking = async (alertId) => {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      throw new Error('Permisos de ubicación en primer plano denegados');
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      throw new Error('Permisos de ubicación en segundo plano denegados');
    }

    await AsyncStorage.setItem('currentAlertId', alertId.toString());

    await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: 60000,
      distanceInterval: 0,
      foregroundService: {
        notificationTitle: 'Seguimiento de Alerta',
        notificationBody: 'Enviando ubicación de la alerta',
      },
    });

    locationUpdateInterval = setInterval(async () => {
      try {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        await sendLocationUpdate(alertId, latitude, longitude);
      } catch (error) {
        console.error('Error al obtener la ubicación en primer plano:', error);
      }
    }, 60000);

    return true;
  } catch (error) {
    console.error('Error al iniciar el seguimiento de ubicación:', error);
    return false;
  }
};

export const stopLocationTracking = async () => {
  try {
    const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING_TASK);
    if (isTaskRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
    }

    if (locationUpdateInterval) {
      clearInterval(locationUpdateInterval);
      locationUpdateInterval = null;
    }

    await AsyncStorage.removeItem('currentAlertId');

    return true;
  } catch (error) {
    console.error('Error al detener el seguimiento de ubicación:', error);
    return false;
  }
};