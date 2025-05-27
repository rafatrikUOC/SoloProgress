import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { FontAwesome, Feather } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { supabase } from "../../../global/services/supabaseService";
import { clearData } from "../../../global/utils/storage";
import { ActionButton, HeaderBlock } from "../../../global/components/UIElements";

export default function ChangePasswordScreen({ navigation }) {
  const { colors, typography } = useThemeContext();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");
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
    }, 400);
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

  const handleChangePassword = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setInfo("Password changed successfully!");
      await clearData("mustChangePassword");
      setTimeout(() => {
        navigation.replace("Home");
      }, 1200);
    } catch (err) {
      setError(err.message || "Could not change password.");
    } finally {
      setLoading(false);
    }
  };

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
      textAlign: "center",
    },
    infoText: {
      color: colors.text.success,
      marginTop: 8,
      ...typography.bodySmall,
      textAlign: "center",
    },
    loadingContainer: {
      alignItems: "center",
      marginVertical: 16,
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
      backgroundColor: colors.input.background || colors.card,
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
      <HeaderBlock
        title="Set a new password"
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
      {info ? <Text style={styles.infoText}>{info}</Text> : null}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.text.primary} />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      <ActionButton
        text="Change password"
        disabled={!isValid || loading}
        onPress={handleChangePassword}
      />
    </KeyboardAvoidingView>
  );
}
