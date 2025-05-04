import React from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";
import { useThemeContext } from "../../services/ThemeContext";
import { FontAwesome5 } from "@expo/vector-icons";

export default function Onboarding4({ navigation }) {
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
        backButton: {
          position: "absolute",
          top: 48,
          left: 24,
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 6,
          paddingHorizontal: 14,
          backgroundColor: "rgba(0,0,0,0.4)",
          borderRadius: 20,
          zIndex: 10,
        },
        backText: {
          ...typography.bodySmall,
          color: colors.text.white,
          marginLeft: 6,
        },
        centerArea: {
            backgroundColor: "rgba(0,0,0,0.6)",
            borderRadius: 24,
            padding: 32,
            alignItems: "center",
            marginHorizontal: 32,
        },
        icon: {
            marginBottom: 16,
        },
        text: {
            ...typography.launchSubtitle,
            color: colors.text.white,
            textAlign: "center",
            marginBottom: 24,
        },
        progressBar: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
        },
        bar: {
            width: 24,
            height: 4,
            borderRadius: 2,
            marginHorizontal: 4,
            backgroundColor: colors.text.muted,
        },
        barActive: {
            backgroundColor: colors.text.primary,
        },
        buttonWrapper: {
            alignSelf: "center",
            width: "60%",
            marginTop: 12,
        },
        button: {
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#fff",
            paddingVertical: 14,
            paddingHorizontal: 48,
            alignItems: "center",
            backdropFilter: "blur(20px)",
        },
        buttonText: {
            ...typography.buttonLarge,
            color: colors.text.primary,
            textAlign: "center",
        },
    });

    return (
        <ImageBackground
            source={require("../../../assets/onboarding-bg-2.png")}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.overlay} />

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <FontAwesome5 name="chevron-left" size={16} color={colors.text.white} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <View style={styles.centerArea}>
                <FontAwesome5 name="running" size={48} color={colors.text.primary} style={styles.icon} />
                <Text style={styles.text}>
                    Unlock your fitness potential. Start today!
                </Text>
                <View style={styles.progressBar}>
                    <View style={styles.bar} />
                    <View style={styles.bar} />
                    <View style={[styles.bar, styles.barActive]} />
                </View>
            </View>
            <View style={styles.buttonWrapper}>
                <TouchableOpacity
                    style={styles.button}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate("Auth")}
                >
                    <Text style={styles.buttonText}>Get started</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}