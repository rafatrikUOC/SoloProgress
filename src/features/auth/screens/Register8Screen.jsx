import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Text, Platform, KeyboardAvoidingView, Keyboard } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton, ActionButton, HeaderBlock } from "../../../global/components/UIElements";
import { saveData, getData } from "../../../global/utils/storage";

export default function Register8({ navigation }) {
  const { colors, typography } = useThemeContext();
  const [email, setEmail] = useState("");
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

  // Load previously stored email if available
  useEffect(() => {
    const loadEmail = async () => {
      const registrationData = await getData("registrationData");
      if (registrationData?.email) setEmail(registrationData.email);
    };
    loadEmail();
  }, []);

  // Debounced email validation
  useEffect(() => {
    const timeout = setTimeout(() => {
      validateEmail(email);
    }, 400);
    return () => clearTimeout(timeout);
  }, [email]);

  // Validate email format only
  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value) {
      setIsValid(false);
      setError("");
      deleteEmailData();
      return;
    }

    if (!emailRegex.test(value)) {
      setIsValid(false);
      setError("Invalid email format");
      deleteEmailData();
      return;
    }

    setIsValid(true);
    setError("");
    saveEmail(value);
  };

  // Save email to registrationData in storage
  const saveEmail = (email) => {
    getData("registrationData").then((registrationData = {}) => {
      registrationData.email = email;
      saveData("registrationData", registrationData);
    });
  };

  // Remove email from registrationData in storage
  const deleteEmailData = () => {
    getData("registrationData").then((registrationData = {}) => {
      delete registrationData.email;
      saveData("registrationData", registrationData);
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      justifyContent: "center",
      padding: 24,
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
    if (error) return colors.text.danger;
    if (isValid && email) return colors.text.success;
    return colors.input.borderColor || colors.input.border || colors.border;
  };

  // Get icon based on validation state
  const getIcon = () => {
    if (error && email) {
      return <FontAwesome name="times-circle" size={20} color={colors.text.danger} style={styles.icon} />;
    }
    if (isValid && email) {
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
        title={"What's your email?"}
        subtitle={"We'll use it to keep your account secure"}
      />

      <View style={[styles.inputWrapper, { borderColor: getBorderColor() }]}>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          placeholderTextColor={colors.input.placeholder}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="done"
          value={email}
          onChangeText={setEmail}
          autoComplete="email"
        />
        {getIcon()}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <ActionButton
        text="Continue"
        disabled={!isValid}
        onPress={() => navigation.navigate("Register9")}
      />
    </KeyboardAvoidingView>
  );
}
