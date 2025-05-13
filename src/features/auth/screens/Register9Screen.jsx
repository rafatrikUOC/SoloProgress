import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton, ActionButton, HeaderBlock } from "../../../global/components/UIElements";
import { getData, saveData } from "../../../global/utils/storage"; 
import { checkIfUsernameExists } from "../services/authService";

export default function Register9({ navigation }) {
  const { colors, typography } = useThemeContext();
  const [username, setUsername] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState("");

  // Cargar el alias guardado si existe
  useEffect(() => {
    const loadUsername = async () => {
      const registrationData = await getData("registrationData");
      if (registrationData?.username) {
        setUsername(registrationData.username);
      }
    };
    loadUsername();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      validateUsername(username.trim());
    }, 500);
    return () => clearTimeout(timeout);
  }, [username]);

  const validateUsername = async (value) => {
    if (!value) {
      setIsValid(false);
      setError("");
      await deleteUsernameData();
      return;
    }

    if (value.length < 3 || value.length > 20) {
      setIsValid(false);
      setError("Username must be 3–20 characters long");
      await deleteUsernameData();
      return;
    }

    // Comprobar disponibilidad del correo
    const existingUser = await checkIfUsernameExists(value);
    if (existingUser) {
      setIsValid(false);
      setError("Username is already registered");
      return;
    }

    setIsValid(true);
    setError("");
    await saveUsername(value);
  };

  const saveUsername = async (username) => {
    const registrationData = await getData("registrationData") || {};
    registrationData.username = username;
    await saveData("registrationData", registrationData);
  };

  const deleteUsernameData = async () => {
    const registrationData = await getData("registrationData") || {};
    delete registrationData.username;
    await saveData("registrationData", registrationData);
  };

  const checkUsernameAvailability = async (value) => {
    // TODO: Replace with actual API/backend call
    return true;
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

  const getBorderColor = () => {
    if (error) return colors.text.danger;
    if (isValid) return colors.text.success;
    return colors.input.borderColor || colors.input.border || colors.border;
  };

  const getIcon = () => {
    if (error) {
      return <FontAwesome name="times-circle" size={20} color={colors.text.danger} style={styles.icon} />;
    }
    if (isValid) {
      return <FontAwesome name="check-circle" size={20} color={colors.text.success} style={styles.icon} />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
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
          autoComplete="username"
        />
        {getIcon()}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <ActionButton
        text="Continue"
        disabled={!isValid}
        onPress={() => navigation.navigate("Register10")}
      />
    </View>
  );
}
