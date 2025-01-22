import React from "react";
import { StyleSheet, View, Text, Image, ImageBackground } from 'react-native';

import Btn from '../components/alertButton.jsx';

const iconIncendio = require("../assets/incendio.png");
const iconPanico = require("../assets/panicoBTN.png");
const iconMedico = require("../assets/medico.png");

const logo = require("../assets/logo.png")
const backgroundImg = require("../assets/background.png")

export default function Main() {

  return (
        <ImageBackground source={backgroundImg} style={styles.backgroundImg}>
          <View style={styles.mainContainer}>
          <View style={styles.containerNav}>
            <Image style={styles.logo} source={logo}/>
            <Text style={styles.subText}>Mis Alarmas</Text>
          </View>

            <View style={styles.containerBtn}>
                <Btn
                    onPress={() => {}}
                    backgroundColor={{ pressed: '#c0d7fd', default: '#fe0000' }}
                    text="PANICO"
                    displayText="PÁNICO"
                    imageSource={iconPanico}
                />
                <Btn
                    onPress={() => {}}
                    backgroundColor={{ pressed: "#fdaea9", default: "#ffcc00"}}
                    text="INCENDIO"
                    displayText="INCENDIO"
                    imageSource={iconIncendio}
                />
                <Btn
                    onPress={() => {}}
                    backgroundColor={{ pressed: '#fdecbe', default: '#0000fe'}}
                    text="ASISTENCIA"
                    displayText="ASISTENCIA"
                    imageSource={iconMedico}
                />
            </View>
            </View>
        </ImageBackground>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    marginTop: 50,
  },
  containerNav: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    padding: 20,
  },
  containerBtn: {
    flex: 20,
    justifyContent: "space-evenly",
    marginHorizontal: 20,
    paddingVertical: 30,
  },
  logo: {
    width: 200,
    height: 100,
    objectFit: "contain"
  },
  subText: {
    fontSize: 18,
    color: "white",
    fontFamily: "GothamBold",
    paddingLeft: 5,
    borderBottomWidth: 1,
    borderColor: "white",
  },
  backgroundImg: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  }
});