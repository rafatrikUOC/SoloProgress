import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Keyboard
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { sendPasswordResetEmail, verifyPasswordResetToken } from "../services/authService";
import { saveData } from "../../../global/utils/storage";

export default function ForgotPasswordScreen({ navigation }) {
  const { colors, typography } = useThemeContext();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });
    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  // Token must be 6 digits, numeric
  const isTokenValid = token.length === 6 && /^\d{6}$/.test(token);

  const handleSendEmail = async () => {
    setLoading(true);
    setError("");
    setInfo("");
    try {
      await sendPasswordResetEmail(email);
      setStep(2);
      setInfo("If the email is correct, you'll receive a token to reset your password.");
    } catch (err) {
      setError(err.message || "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async () => {
    if (!isTokenValid) {
      setError("Enter the 6-digit token you received by email.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await verifyPasswordResetToken(email, token);
      await saveData("mustChangePassword", true);
      setInfo("Token verified! Redirecting to change password...");
      // Aquí RootNavigator/HomeScreen debería redirigir
    } catch (err) {
      setInfo("");
      setError(err.message || "Could not verify token.");
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      justifyContent: "center",
      padding: 24,
    },
    scroll: {
      flexGrow: 1,
      justifyContent: "center",
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
      color: colors.input.color || colors.input.text,
      ...typography.input,
      backgroundColor: colors.card,
      borderRadius: 4,
      paddingVertical: 16,
      paddingHorizontal: 16,
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
    errorText: {
      color: colors.text.danger,
      marginTop: 8,
      ...typography.bodySmall,
      textAlign: "center",
    },
    infoText: {
      color: colors.text.success,
      marginTop: 8,
      ...typography.bodySmall,
      textAlign: "center",
    },
    loadingContainer: { alignItems: "center", marginVertical: 16 },
    loadingText: {
      color: colors.text.primary,
      textAlign: "center",
      marginVertical: 16,
      ...typography.bodyMedium,
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled={isKeyboardVisible}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>Even the strongest falter</Text>
          <Text style={styles.description}>Reset your password and rise again</Text>
        </View>

        {step === 1 && (
          <>
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
            <TouchableOpacity
              style={styles.button}
              onPress={handleSendEmail}
              disabled={loading || !email}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.label}>Enter the 6-digit token you received by email</Text>
            <TextInput
              style={styles.input}
              placeholder="Token"
              placeholderTextColor={colors.text.muted}
              autoCapitalize="none"
              keyboardType="numeric"
              maxLength={6}
              value={token}
              onChangeText={setToken}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleVerifyToken}
              disabled={loading || !isTokenValid}
            >
              <Text style={styles.buttonText}>Verify token</Text>
            </TouchableOpacity>
          </>
        )}

        {info ? <Text style={styles.infoText}>{info}</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.text.primary} />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Back to login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
