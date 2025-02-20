const config = require('./configAPI');

module.exports = {
  expo: {
    name: "securitybutton",
    slug: "securitybutton",
    version: "1.0.3",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    scheme: "securitybutton",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.postadigital.securitybutton",
      buildNumber: "3",
      NSLocationWhenInUseUsageDescription: "Esta app requiere acceso a tu ubicación para mejorar la experiencia del usuario.",
      NSLocationAlwaysUsageDescription: "Esta app requiere acceso constante a tu ubicación."
    },
    android: {
      package: "com.postadigital.securitybutton",
      versionCode: 2,
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "FOREGROUND_SERVICE",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-font"
    ],
    extra: {
      apiUrl: config.API_URL(),
      router: {
        origin: false
      },
      eas: {
        projectId: "85f4bdab-42ef-4efa-a4a8-7777f54b8ede"
      }
    }
  }
};