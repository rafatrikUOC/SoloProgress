import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Platform, KeyboardAvoidingView, Keyboard, ActivityIndicator } from "react-native";
import { FontAwesome, Feather } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton, ActionButton, HeaderBlock } from "../../../global/components/UIElements";
import { useRegisterUser } from "../hooks/useRegisterUser";
import { clearData } from "../../../global/utils/storage";

export default function Register10({ navigation }) {
  const { colors, typography } = useThemeContext();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { handleRegister, loading: hookLoading, error: registerError } = useRegisterUser();
  const [localLoading, setLocalLoading] = useState(false);
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      validatePasswords(password, confirmPassword);
    }, 500);
    return () => clearTimeout(timeout);
  }, [password, confirmPassword]);

  const validatePasswords = (pass, confirm) => {
    const secureRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!pass || !confirm) {
      setIsValid(false);
      setError("");
      return;
    }

    if (!secureRegex.test(pass)) {
      setIsValid(false);
      setError("Password must be 8+ characters, with uppercase, lowercase, number and symbol");
      return;
    }

    if (pass !== confirm) {
      setIsValid(false);
      setError("Passwords do not match");
      return;
    }

    setIsValid(true);
    setError("");
  };

  const onSubmit = async () => {
    if (!isValid || hookLoading || localLoading) return;
    setLocalLoading(true);

    // Success callback: clear storage and navigate
    const onSuccess = () => {
      clearData("registrationData");
      navigation.replace("Login", { registrationSuccess: true });
    };

    await handleRegister(password, onSuccess);
    setLocalLoading(false);
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      paddingHorizontal: 24,
      paddingTop: 64,
    },
    errorText: {
      color: colors.text.danger,
      marginTop: 8,
      ...typography.bodySmall,
    },
    loadingContainer: {
      alignItems: "center",
      marginVertical: 16
    },
    loadingText: {
      color: colors.text.primary,
      textAlign: "center",
      marginVertical: 16,
      ...typography.bodyMedium,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.input.background,
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 12,
      marginBottom: 12,
    },
    input: {
      flex: 1,
      color: colors.input.color || colors.input.text,
      ...typography.input,
      paddingVertical: 16,
    },
    icon: {
      marginLeft: 8,
    },
    eye: {
      padding: 8,
    },
  });

  const getBorderColor = (field) => {
    if (error && (field === "password" || field === "confirm")) return colors.text.danger;
    if (isValid && password && confirmPassword) return colors.text.success;
    return colors.input.borderColor || colors.input.border || colors.border;
  };

  const getStatusIcon = (field) => {
    if (error && (field === "password" || field === "confirm")) {
      return <FontAwesome name="times-circle" size={20} color={colors.text.danger} style={styles.icon} />;
    }
    if (isValid && password && confirmPassword) {
      return <FontAwesome name="check-circle" size={20} color={colors.text.success} style={styles.icon} />;
    }
    return null;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled={isKeyboardVisible}
      style={styles.container}
    >
      <BackButton onPress={() => navigation.goBack()} />

      <HeaderBlock
        title="Create a password"
        subtitle="Must be at least 8 characters, with uppercase, number and symbol"
      />

      <View style={[styles.inputWrapper, { borderColor: getBorderColor("password") }]}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.input.placeholder}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          autoComplete="password"
        />
        <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} style={styles.eye}>
          <Feather
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color={colors.input.placeholder}
          />
        </TouchableOpacity>
        {getStatusIcon("password")}
      </View>

      <View style={[styles.inputWrapper, { borderColor: getBorderColor("confirm") }]}>
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor={colors.input.placeholder}
          secureTextEntry={!showConfirm}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoComplete="password"
        />
        <TouchableOpacity onPress={() => setShowConfirm((prev) => !prev)} style={styles.eye}>
          <Feather
            name={showConfirm ? "eye-off" : "eye"}
            size={20}
            color={colors.input.placeholder}
          />
        </TouchableOpacity>
        {getStatusIcon("confirm")}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {registerError ? <Text style={styles.errorText}>{registerError}</Text> : null}

      {(hookLoading || localLoading) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.text.primary} />
          <Text style={styles.loadingText}>Creating user...</Text>
        </View>
      )}

      <ActionButton
        text="Create account"
        disabled={!isValid}
        onPress={onSubmit}
      />

    </KeyboardAvoidingView>

  );
}