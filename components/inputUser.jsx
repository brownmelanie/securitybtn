import { View, StyleSheet, Text } from "react-native"

const Input = ({title, content}) => {
    return (
        <View style={styles.wrapper}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.content}>{content}</Text>
        </View>
    )
}

const styles = StyleSheet.create ({
    wrapper: {
        borderBottomWidth: 1,
        borderBlockColor: "#6C6C72",
        width: "80vw",
        marginTop: 20,
    },
    title: {
        color: "#6C6C72",
        fontFamily: "Gotham",
    },
    content: {
        fontFamily: "GothamBold",
        color: "#1D1B69",
        fontSize: 22,
        marginBottom: 5,
       
    },
})

export default Input
