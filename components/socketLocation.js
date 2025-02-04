import io from "socket.io-client";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import Constants from "expo-constants";

const apiUrl = Constants.expoConfig.extra.apiUrl;

export const iniciarSocket = async (alertId) => {
    try {

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.error('Permisos de ubicación denegados');
            return;
        }

        const accessToken = await AsyncStorage.getItem('accessToken');
        console.log ("Token obtenido:", accessToken);

        if (!accessToken) {
            console.error('Inicia sesión nuevamente');
            return;
        }

        console.log("Intentando conectar a ", apiUrl);
        let socket = io(apiUrl, {
            extraHeaders: {
                Authorization: `Bearer ${accessToken}`,
            },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            randomizationFactor: 0.5,
            timeout: 10000,
            transports: ['websocket']
        });

        function sendUpdate (alertId, socket) {
            return setInterval(async () => {
                try {
                    const location = await Location.getCurrentPositionAsync({});
                    const { latitude, longitude } = location.coords;
   
                    socket.emit('updateLocation', {
                        id: alertId,
                        location: { latitude, longitude }
                    });
                    console.log('Ubicación enviada:', { latitude, longitude, alertId });
                } catch (error) {
                    console.error('Error detallado al obtener la ubicación:', {
                        message: error.message,
                        stack: error.stack,
                        name: error.name
                    });
                }
            }, 10000);
        }

        let interval;

        socket.on('connect', () => {
            console.log('Socket conectado');
            interval = sendUpdate(alertId, socket);
        });

        socket.on("error", (error) => {
            console.log(error);
        } )

        socket.on('connect_error', (error) => {
            console.log('Error de conexión:', error.message);
        });

        socket.on('disconnect', (reason) => {
            console.log('Desconectado del servidor:', reason);
            detenerActualizacionesUbicacion(interval);
            if (reason === 'io server disconnect') {
                console.log('Conexión cerrada por el servidor, deteniendo actualizaciones de ubicación.');
                Alert.alert("Alerta finalizada", "Alerta cerrada por el servidor, deteniendo actualizaciones de ubicación")
            }
        });
    } catch (error) {
        console.error('Error detallado al iniciar el socket:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
    }
};

const detenerActualizacionesUbicacion = (interval) => {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
};