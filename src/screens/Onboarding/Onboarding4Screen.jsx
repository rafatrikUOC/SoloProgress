import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { useThemeContext } from "../../services/ThemeContext";

export default function LaunchScreen({ onFinish }) {
    const { colors, typography } = useThemeContext();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.body,
        },
        titleRow: {
            ...typography.launchTitle,
        },
        title1: {
            color: colors.text.primary,
            fontWeight: "800",

        },
        title2: {
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
        const timeout = setTimeout(onFinish, 10000);
        return () => clearTimeout(timeout);
    }, [onFinish]);

    return (
        <TouchableWithoutFeedback onPress={onFinish}>
            <View style={styles.container}>
                <Text style={styles.titleRow}>
                    <Text style={styles.title1}>Solo</Text>
                    <Text style={styles.title2}>Progress</Text>
                </Text>
                <Text style={styles.subtitle}>Arise from the weak</Text>
            </View>
        </TouchableWithoutFeedback>
    );
}