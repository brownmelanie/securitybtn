import { StyleSheet, Image, Pressable, Text, View, TextInput, ImageBackground, Alert, KeyboardAvoidingView, Platform, Linking } from "react-native";
import { Stack, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFont } from "../app/fontContext";
import Constants from "expo-constants";

const iconLogo = require("../assets/logo.png");
const background = require("../assets/background.png")

export function LoginScreen () {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const { fonts, fontsLoaded } = useFont();

    const apiUrl = Constants.expoConfig.extra.apiUrl;

    useEffect(() => {
        const checkSessio = checkSession(router);
        checkSession();
    }, []);

    const handleLogin = async () => {

        if (!email || !password) {
            Alert.alert('Error', 'Por favor, ingrese su email y contraseña.');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            console.log({ email, password })
            console.log("log antes del if")
   
            if (response.ok) {
                const {accessToken, refreshToken} = await response.json();
                await AsyncStorage.setItem('accessToken', accessToken);
                await AsyncStorage.setItem('refreshToken', refreshToken);
                console.log(accessToken, refreshToken);
                    router.push("/main")
            } else {
                console.log(response.text())
                Alert.alert(
                    `Error ${response.status}`,
                    'El email o contraseña ingresados son incorrectos. Intente nuevamente'
                );
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            Alert.alert( 'Error',
                'No se pudo conectar con el servidor, intente nuevamente más tarde'
            );
        }
    };

    const handleOpenPrivacyPolicy = () => {
        const url = 'https://drive.google.com/file/d/1B0kYboHKITYTkwYABRVxDheojD5WUISY/view?usp=drive_link';
        Linking.openURL(url);
    };

    return (
        <ImageBackground source={background} style={styles.backgroundImg}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
            >
            <Stack.Screen
                options={{
                    header: () => <></>,
                }}
            />
            <View style={styles.container}>

                <Image source={iconLogo} style={styles.imgLogo}/>

                <View style={styles.inputCont}>
                   
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>
       
                <View style={styles.containerBtn}>
                    <Pressable style={styles.btn} onPress={handleLogin}>
                        <Text style={styles.btnText}>Iniciar Sesión</Text>
                    </Pressable>
                </View>
            </View>
            <Text style={styles.privacyText}>
                    Al iniciar sesión aceptas nuestras{' '}
                    <Text style={styles.linkText} onPress={handleOpenPrivacyPolicy}>
                        políticas de privacidad
                    </Text>.
                </Text>
            </KeyboardAvoidingView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginVertical: 80,
        backgroundColor: "white",
        borderRadius: 15,
        width: "80%",
        justifyContent: "space-between",
        alignItems: "center",
    },
    imgLogo: {
        width: 250,
        height: 80,
        objectFit: "contain",
    },
    inputCont: {
        width: "95%",
        height: 210,
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderBottomWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 10,
        fontFamily: "Gotham"
      },
    containerBtn: {
        alignItems: "center",
        marginBottom: 40,
    },
    btn: {
        backgroundColor: "#1D1B69",
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 15,
        marginBottom: 10,
    },
    btnText: {
        color: "white",
        textAlign: "center",
        fontSize: 20,
        fontFamily: "Gotham",
    },
    backgroundImg: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center",
        alignItems: "center"
    },
    privacyText: {
        textAlign: 'center',
        marginBottom: 20,
        marginHorizontal: 30,
        color: '#333',
        fontSize: 12,
        paddingHorizontal: 25,
    },
    linkText: {
        textDecorationLine: 'underline',
        color: '#1D1B69',
    }
})
function checkSession(router) {
    return async () => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
            router.push("/main");
        }
    };
}