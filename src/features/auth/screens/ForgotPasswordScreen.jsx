import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useThemeContext } from "../../../global/contexts/ThemeContext";

export default function ForgotPasswordScreen({ navigation }) {
  const { colors, typography } = useThemeContext();
  const [email, setEmail] = useState("");

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      justifyContent: "center",
      padding: 24,
    },
    titleContainer: {
      marginBottom: 36,
      alignItems: "center",
    },
    title: {
      ...typography.screenTitle,
      color: colors.text.primary,
      marginBottom: 4,
      textAlign: "center",
    },
    subtitle: {
      ...typography.bodyLarge,
      color: colors.text.white,
      marginBottom: 2,
      textAlign: "center",
    },
    description: {
      ...typography.bodyMedium,
      color: colors.text.muted,
      textAlign: "center",
    },
    label: {
      ...typography.label,
      color: colors.text.primary,
      marginBottom: 8,
      marginLeft: 2,
    },
    input: {
      ...typography.input,
      backgroundColor: colors.card,
      color: colors.text.white,
      borderRadius: 4,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    button: {
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 8,
      marginBottom: 4,
      borderWidth: 1,
      borderColor: colors.text.primary,
    },
    buttonText: {
      ...typography.buttonLarge,
      color: colors.text.primary,
    },
    link: {
      color: colors.text.primary,
      textAlign: "center",
      marginTop: 20,
      ...typography.bodySmall,
      textDecorationLine: "underline",
    },
  });

  return (
    <View style={styles.container}>
      {/* Header section */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Forgot password?</Text>
        <Text style={styles.subtitle}>Even the strongest falter</Text>
        <Text style={styles.description}>Reset your password and rise again</Text>
      </View>

      {/* Email input with label */}
      <Text style={styles.label}>Enter your email address</Text>
      <TextInput
        style={styles.input}
        placeholder="your@email.com"
        placeholderTextColor={colors.text.muted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* Continue button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      {/* Back to login link */}
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Back to login</Text>
      </TouchableOpacity>
    </View>
  );
}
