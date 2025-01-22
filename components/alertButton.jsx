import { useRef, useState } from "react";
import { Animated, Pressable, View, Text, Image, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { iniciarSocket } from "./socketLocation";
import Constants from "expo-constants";

const Btn = ({ onPress, backgroundColor, text, imageSource, displayText }) => {
    const apiUrl = Constants.expoConfig.extra.apiUrl;
    const [alertId, setAlertId] = useState(null);

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
           
            console.log("renovando alerta")
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
                const {accessToken, refreshToken} = data;
                await AsyncStorage.setItem('accessToken', accessToken);
                await AsyncStorage.setItem('refreshToken', refreshToken);
                console.log("tokens actualizados")
            } else {
                throw new Error('Inicie sesión nuevamente');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
            throw error;
        }
    };

    const handlePress = async () => {
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
                    Alert.alert("Alerta iniciada", `Alerta de tipo ${text} enviada con éxito.`);
                    setAlertId(data.id);
                    iniciarSocket(data.id);
                } else if (response.status === 403) {
                    await refreshAccessToken();
                    await enviarAlerta();
                } else {
                    const errorMessage = Array.isArray(data.message)
                        ? data.message.join(', ')
                        : data.message || "Ocurrió un error al enviar la alerta. Intente nuevamente.";
                    console.log(`Error ${response.status}`, errorMessage)
                    Alert.alert("Error", "Ocurrió un error al enviar la alerta. Asegurese de no tener alertas activas.");
                }
            };
            await enviarAlerta();
        } catch (error) {
            console.error('Error al enviar la alerta:', error);
            Alert.alert('Error', 'No se pudo enviar la alerta. Asegurese de no tener alertas activas.');
        }
        if (onPress) {
            onPress();
        }
    };

    return (
        <Pressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Animated.View style={[styles.wrapperCustom, { backgroundColor: animatedBackgroundColor }]}>
                <View style={styles.wrapperBtn}>
                    <Image source={imageSource}/>
                    <Text style={styles.textBtn}>{displayText}</Text>
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