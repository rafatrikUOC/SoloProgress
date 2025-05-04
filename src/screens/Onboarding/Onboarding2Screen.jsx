import React from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";
import { useThemeContext } from "../../services/ThemeContext";
import { FontAwesome5 } from "@expo/vector-icons";

export default function Onboarding2({ navigation }) {
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
        skipButton: {
            position: "absolute",
            top: 48,
            right: 32,
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 6,
            paddingHorizontal: 14,
            backgroundColor: "rgba(0,0,0,0.4)",
            borderRadius: 20,
            zIndex: 10,
            color: colors.text.primary
        },
        skipText: {
            ...typography.bodySmall,
            color: colors.text.primary,
            marginRight: 6,
        },
        centerArea: {
            backgroundColor: "rgba(0,0,0,0.6)",
            borderRadius: 15,
            padding: 32,
            alignItems: "center",
            marginHorizontal: 32,
        },
        icon: {
            marginBottom: 16,
        },
        text: {
            ...typography.launchSubtitle,
            color: "#FFFFFF",
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
            
            <TouchableOpacity
                style={styles.skipButton}
                activeOpacity={0.7}
                onPress={() => navigation.replace("Auth")}
            >
                <Text style={styles.skipText}>Skip</Text>
                <FontAwesome5 name="chevron-right" size={16} color={colors.text.primary} />
            </TouchableOpacity>
            
            <View style={styles.centerArea}>
                <FontAwesome5 name="running" size={48} color={colors.text.primary} style={styles.icon} />
                <Text style={styles.text}>
                    Your path to personalized fitness starts here.
                </Text>
                {/* Barra de progreso: este es el paso 2 de 3 */}
                <View style={styles.progressBar}>
                    <View style={[styles.bar, styles.barActive]} />
                    <View style={styles.bar} />
                    <View style={styles.bar} />
                </View>
            </View>
            <View style={styles.buttonWrapper}>
                <TouchableOpacity
                    style={styles.button}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate("Onboarding3")}
                >
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}
