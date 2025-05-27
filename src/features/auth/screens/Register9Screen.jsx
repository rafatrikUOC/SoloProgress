import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Text, Platform, KeyboardAvoidingView, Keyboard } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton, ActionButton, HeaderBlock } from "../../../global/components/UIElements";
import { getData, saveData } from "../../../global/utils/storage";

export default function Register9({ navigation }) {
  const { colors, typography } = useThemeContext();
  const [username, setUsername] = useState("");
  const [isValid, setIsValid] = useState(false);
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

  // Load previously stored username if available
  useEffect(() => {
    const loadUsername = async () => {
      const registrationData = await getData("registrationData");
      if (registrationData?.username) setUsername(registrationData.username);
    };
    loadUsername();
  }, []);

  // Debounced username validation
  useEffect(() => {
    const timeout = setTimeout(() => {
      validateUsername(username.trim());
    }, 400);
    return () => clearTimeout(timeout);
  }, [username]);

  // Validate username format and availability
  const validateUsername = (value) => {
    const usernameRegex = /^[a-zA-Z0-9_]{8,20}$/;

    if (!value) {
      setIsValid(false);
      setError("");
      deleteUsernameData();
      return;
    }

    if (!usernameRegex.test(value)) {
      setIsValid(false);
      setError("Must be 8–20 characters (letters, numbers or _)");
      deleteUsernameData();
      return;
    }

    setIsValid(true);
    setError("");
    saveUsername(value);
  };

  // Save username to registrationData in storage
  const saveUsername = (username) => {
    getData("registrationData").then((registrationData = {}) => {
      registrationData.username = username;
      saveData("registrationData", registrationData);
    });
  };

  // Remove username from registrationData in storage
  const deleteUsernameData = () => {
    getData("registrationData").then((registrationData = {}) => {
      delete registrationData.username;
      saveData("registrationData", registrationData);
    });
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
  });

  // Get border color based on validation state
  const getBorderColor = () => {
    if (error && username) return colors.text.danger;
    if (isValid && username) return colors.text.success;
    return colors.input.borderColor || colors.input.border || colors.border;
  };

  // Get icon based on validation state
  const getIcon = () => {
    if (error && username) {
      return <FontAwesome name="times-circle" size={20} color={colors.text.danger} style={styles.icon} />;
    }
    if (isValid && username) {
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
        title={"Choose your username"}
        subtitle={"This is how others will see you"}
      />

      <View style={[styles.inputWrapper, { borderColor: getBorderColor() }]}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={colors.input.placeholder}
          value={username}
          onChangeText={setUsername}
          maxLength={20}
          autoCapitalize="none"
          autoComplete="username"
          textContentType="username"
          returnKeyType="done"
        />
        {getIcon()}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <ActionButton
        text="Continue"
        disabled={!isValid}
        onPress={() => navigation.navigate("Register10")}
      />
    </KeyboardAvoidingView>
  );
}
