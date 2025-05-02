import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { useThemeContext } from "../services/ThemeContext";

export default function LaunchScreen({ onFinish }) {
    const { colors, typography } = useThemeContext();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.body,
        },
        title1: {
            ...typography.launchTitle,
            color: colors.text.primary,
            fontWeight: "800",

        },
        title2: {
            ...typography.launchTitle,
            color: colors.text.primaryHover,
            fontWeight: "400",
        },
        subtitle: {
            ...typography.launchSubtitle,
            color: colors.text.secondaryActive,
            fontStyle: "italic",
        },
    });

    useEffect(() => {
        const timeout = setTimeout(onFinish, 2000);
        return () => clearTimeout(timeout);
    }, [onFinish]);

    return (
        <TouchableWithoutFeedback onPress={onFinish}>
            <View style={styles.container}>
                <Text>
                    <Text style={styles.title1}>Solo</Text>
                    <Text style={styles.title2}>Progress</Text>
                </Text>
                <Text style={styles.subtitle}>Arise from the weak</Text>
            </View>
        </TouchableWithoutFeedback>
    );
}