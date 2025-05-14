import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton, ActionButton, HeaderBlock } from "../../../global/components/UIElements";
import { saveData, getData } from "../../../global/utils/storage";
import { checkIfEmailExists } from "../services/authService";

export default function Register8({ navigation }) {
  const { colors, typography } = useThemeContext();
  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState("");

  // Cargar el correo guardado si existe
  useEffect(() => {
    const loadEmail = async () => {
      const registrationData = await getData("registrationData");
      if (registrationData?.email) {
        setEmail(registrationData.email);
      }
    };
    loadEmail();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      validateEmail(email);
    }, 500);
    return () => clearTimeout(timeout);
  }, [email]);

  const validateEmail = async (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Si el campo está vacío
    if (!value) {
      setIsValid(false);
      setError("");
      await deleteEmailData();
      return;
    }

    // Si el formato del correo es inválido
    if (!emailRegex.test(value)) {
      setIsValid(false);
      setError("Invalid email format");
      await deleteEmailData();
      return;
    }

    // Comprobar disponibilidad del correo
    const existingUser = await checkIfEmailExists(value);
    if (existingUser) {
      setIsValid(false);
      setError("Email is already registered");
      await deleteEmailData();
      return;
    }

    setIsValid(true);
    setError("");
    saveEmail(value);  // Guardar el correo si es válido
  };

  const saveEmail = async (email) => {
    const registrationData = await getData("registrationData") || {};
    registrationData.email = email;
    await saveData("registrationData", registrationData);  // Guardar el correo si es válido
  };

  const deleteEmailData = async () => {
    const registrationData = await getData("registrationData") || {};
    delete registrationData.email;  // Eliminar correo de registrationData
    await saveData("registrationData", registrationData);  // Guardar los datos actualizados sin el correo
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
      color: colors.input.color || colors.input.text, // fallback
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
    </View>
  );
}
