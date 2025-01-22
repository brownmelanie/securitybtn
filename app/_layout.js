import React from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router"
import { FontProvider } from "./fontContext.js";


export default function Layout() {

    return (
            <FontProvider>
                <View style={styles.main}>
                    <Stack
                        screenOptions={{
                            headerTitle: "",
                            header: () => <></>
                    }}
                    />
                </View>
            </FontProvider>
    )
}

const styles = StyleSheet.create ({
    main: {
        flex: 1,
    },
})