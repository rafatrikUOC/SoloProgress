import React from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableWithoutFeedback } from "react-native";
import { useThemeContext } from "../../services/ThemeContext";

export default function Onboarding1({ navigation }) {
    const { colors, typography } = useThemeContext();

    const styles = StyleSheet.create({
        background: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.body,
        },
        overlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "#00000080",
        },
        title: {
            ...typography.screenTitle,
            color: colors.text.muted,
        },
        logo1: {
            ...typography.launchTitle,
            color: colors.text.primary,
            fontWeight: "800",
        },
        logo2: {
            ...typography.launchTitle,
            color: colors.text.primaryHover,
            fontWeight: "400",
        },
        subtitle: {
            ...typography.launchSubtitle,
            color: colors.text.muted,
            fontStyle: "italic",
        },
        centered: {
            justifyContent: "center",
            alignItems: "center",
        },
        button: {
            backgroundColor: colors.primary,
            padding: 10,
            borderRadius: 4
        },
    });

    return (
        <TouchableWithoutFeedback onPress={() => navigation.navigate("Onboarding2")}>
            <ImageBackground
                source={require("../../../assets/onboarding-bg-1.png")}
                style={styles.background}
                resizeMode="cover"
            >
                <View style={styles.overlay} pointerEvents="none" />
                <View style={styles.centered}>
                    <Text style={styles.title}>
                        Welcome to
                    </Text>
                    <Text>
                        <Text style={styles.logo1}>Solo</Text>
                        <Text style={styles.logo2}>Progress</Text>
                    </Text>
                    <Text style={styles.subtitle}>
                        Arise from the weak
                    </Text>
                </View>
            </ImageBackground>
        </TouchableWithoutFeedback>
    );
}
