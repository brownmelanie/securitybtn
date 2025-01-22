import { View, StyleSheet, Text, Image } from "react-native";
const logo = require("../assets/logo.png")

const Navbar = () => {

    return (
      <View style={styles.containerNav}>
        <Image style={styles.logo} source={logo}/>
        <Text style={styles.subText}>Mis Alarmas</Text>
      </View>
    )
}

const styles = StyleSheet.create ({
    containerNav: {
        flexDirection: "column",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 50,
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
})

export default Navbar