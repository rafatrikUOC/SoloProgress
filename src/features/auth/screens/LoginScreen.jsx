import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  KeyboardAvoidingView
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import ToastMessage from "../../../global/components/ToastMessage";
import { UserContext } from "../../../global/contexts/UserContext";
import { useLogin } from "../hooks/useLogin";

export default function LoginScreen({ navigation, route }) {
  const { colors, typography } = useThemeContext();
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useContext(UserContext);
  const { login, loading, error: loginError } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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

  const handleLogin = async () => {
    try {
      const user = await login(email, password);
      if (user && user.info) {
        setUser(user);
        setError("");
      } else {
        setError("Login did not return a valid user.");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

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
      flex: 1,
      color: colors.input.color || colors.input.text,
      ...typography.input,
      paddingVertical: 16,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.input.background,
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 12,
      marginBottom: 12,
      borderColor: colors.input.borderColor || colors.border,
    },
    eye: {
      padding: 8,
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
    errorText: {
      color: colors.text.danger,
      ...typography.bodySmall,
      marginBottom: 12,
      textAlign: "center",
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled={isKeyboardVisible}
      style={styles.container}
    >
      {/* Show success toast after registration */}
      {route.params?.registrationSuccess && (
        <ToastMessage
          message={"Account created successfully. Please check your email to confirm your account."}
          type={"success"}
        />
      )}

      {/* Welcome message */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Welcome</Text>
        <Text style={styles.welcomeSubtitle}>Your next workout awaits</Text>
        <Text style={styles.welcomeText}>Log back in and keep progressing</Text>
      </View>

      {/* Email input field */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.text.muted}
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          textContentType="emailAddress"
        />
      </View>

      {/* Password input field with visibility toggle */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.text.muted}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          textContentType="password"
        />
        <TouchableOpacity
          onPress={() => setShowPassword((prev) => !prev)}
          style={styles.eye}
          accessibilityLabel={showPassword ? "Hide password" : "Show password"}
        >
          <Feather
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color={colors.input.placeholder}
          />
        </TouchableOpacity>
      </View>

      {/* Display error message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Forgot password link */}
      <View style={styles.forgotContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </TouchableOpacity>
      </View>

      {/* Login button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>

      {/* Sign up link */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register1")}>
          <Text style={styles.registerLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
