import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useThemeContext } from "../../services/ThemeContext";

export default function LoginScreen({ navigation }) {
  const { colors, typography } = useThemeContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      justifyContent: "center",
      padding: 24,
    },
    welcomeContainer: {
      marginBottom: 36,
      alignItems: "center",
    },
    welcomeTitle: {
      ...typography.screenTitle,
      color: colors.text.primary,
      marginBottom: 4,
      textAlign: "center",
    },
    welcomeSubtitle: {
      ...typography.bodyLarge,
      color: colors.text.white,
      marginBottom: 2,
      textAlign: "center",
    },
    welcomeText: {
      ...typography.bodyMedium,
      color: colors.text.muted,
      textAlign: "center",
    },
    input: {
      ...typography.input,
      backgroundColor: colors.card,
      color: colors.text.white,
      borderRadius: 4,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    forgotContainer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: 16,
    },
    forgotLink: {
      color: colors.text.primary,
      ...typography.bodySmall,
      textDecorationLine: "underline",
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
    registerContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 20,
    },
    registerText: {
      ...typography.bodySmall,
      color: colors.text.muted,
    },
    registerLink: {
      ...typography.bodySmall,
      color: colors.text.primary,
      fontWeight: "bold",
      marginLeft: 4,
      textDecorationLine: "underline",
    },
  });

  return (
    <View style={styles.container}>
      {/* Welcome section */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Welcome</Text>
        <Text style={styles.welcomeSubtitle}>Your next workout awaits</Text>
        <Text style={styles.welcomeText}>Log back in and keep progressing</Text>
      </View>

      {/* Login form */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.text.muted}
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.text.muted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <View style={styles.forgotContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>

      {/* Register section */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register1")}>
          <Text style={styles.registerLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
