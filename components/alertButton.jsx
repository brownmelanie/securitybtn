import React, { useRef, useState } from "react";
import { Animated, Pressable, View, Text, Image, StyleSheet, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { startLocationTracking, stopLocationTracking } from "./locationTracking";
import Constants from "expo-constants";

const Btn = ({ onPress, backgroundColor, text, imageSource, displayText, disabled }) => {
    
    const apiUrl = Constants.expoConfig.extra.apiUrl;
    const [alertId, setAlertId] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const animatedValue = useRef(new Animated.Value(0)).current;
    const animatedBackgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [backgroundColor.default, backgroundColor.pressed],
    });

    const handlePressIn = () => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const handlePressOut = () => {
        Animated.timing(animatedValue, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const refreshAccessToken = async () => {
        try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
   
            if (!refreshToken) {
                throw new Error('Ocurrió un error, inicie sesión nuevamente.');
            }
           
            console.log("renovando alerta");
            const response = await fetch(`${apiUrl}/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });
   
            const data = await response.json();
            console.log("respondio el endpoint");
            if (response.ok) {
                const {accessToken, refreshToken: newRefreshToken} = data;
                await AsyncStorage.setItem('accessToken', accessToken);
                await AsyncStorage.setItem('refreshToken', newRefreshToken);
                console.log("tokens actualizados");
            } else {
                throw new Error('Inicie sesión nuevamente');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
            throw error;
        }
    };

    const handlePress = async () => {
        if (disabled || isLoading) return;
        setIsLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Error", "Permiso de ubicación denegado");
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            const enviarAlerta = async () => {
                const accessToken = await AsyncStorage.getItem('accessToken');

                if (!accessToken) {
                    Alert.alert("Error", "No se encontró el token de usuario. Inicie sesión nuevamente");
                    return;
                }

                const response = await fetch(`${apiUrl}/alerts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        type: text,
                        location: { latitude, longitude }
                    })
                });
   
                const data = await response.json();
   
                if (response.ok) {
                    const newAlertId = data.id;
                    setAlertId(newAlertId);
                    
                    const trackingStarted = await startLocationTracking(newAlertId);
                    
                    if (trackingStarted) {
                        Alert.alert("Alerta iniciada", `Alerta de tipo ${text} enviada con éxito.`);
                    } else {
                        Alert.alert("Advertencia", "La alerta se envió pero hubo un problema al iniciar el seguimiento de ubicación.");
                    }
                } else if (response.status === 403) {
                    await refreshAccessToken();
                    await enviarAlerta();
                } else {
                    const errorMessage = Array.isArray(data.message)
                        ? data.message.join(', ')
                        : data.message || "Ocurrió un error al enviar la alerta. Intente nuevamente.";
                    console.log(`Error ${response.status}`, errorMessage);
                    Alert.alert("Error", "Ocurrió un error al enviar la alerta. Asegurese de no tener alertas activas.");
                }
            };

            await enviarAlerta();
        } catch (error) {
            console.error('Error al enviar la alerta:', error);
            await stopLocationTracking();
            Alert.alert('Error', 'No se pudo enviar la alerta. Asegurese de no tener alertas activas.');
        } finally {
            setIsLoading(false);
        }

        if (onPress) {
            onPress();
        }
    };

    return (
        <Pressable
            style={[disabled && styles.disabledButton]}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || isLoading}
        >
            <Animated.View style={[styles.wrapperCustom, { backgroundColor: animatedBackgroundColor }]}>
                <View style={styles.wrapperBtn}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Image source={imageSource} />
                            <Text style={styles.textBtn}>{displayText}</Text>
                        </>
                    )}
                </View>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    wrapperCustom: {
      borderRadius: 20,
      height: 140,
      margin: 10,
      elevation: 8,
    },
    disabledButton: {
        opacity: 0.5,
    },
    wrapperBtn: {
        flex: 1,
      alignItems: 'center',
      justifyContent: "center",
    },
    textBtn: {
      marginLeft: 8,
      fontSize: 20,
      color: "white",
      paddingTop: 10,
      textAlign: "center",
      fontFamily: "GothamBlack",
    },
  });

export default Btn;