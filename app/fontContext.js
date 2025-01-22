import React, { createContext, useContext } from "react";
import { useFonts } from "expo-font";

const FontContext = createContext();

export const useFont = () => useContext(FontContext);

export const FontProvider = ({ children }) => {
  const [fontsLoaded] = useFonts({
    GothamXLight: require("../assets/fonts/Gotham-XLight.otf"),
    GothamThin: require("../assets/fonts/Gotham-Thin.otf"),
    Gotham: require("../assets/fonts/Gotham-Medium.otf"),
    GothamBold: require("../assets/fonts/Gotham-Bold.otf"),
    GothamBlack: require("../assets/fonts/Gotham-Black.otf"),
  });

  const fontContextValue = {
    fontsLoaded,
    fonts: {
      xLight: 'GothamXLight',
      thin: 'GothamThin',
      medium: 'Gotham',
      bold: 'GothamBold',
      black: 'GothamBlack'
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <FontContext.Provider value={{fontContextValue}}>
      {children}
    </FontContext.Provider>
  );
};

export default FontProvider;
