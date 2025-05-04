import React from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";
import { useThemeContext } from "../../services/ThemeContext";
import { FontAwesome5 } from "@expo/vector-icons";

export default function Register1({ navigation }) {
  const { colors, typography } = useThemeContext();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
    },
    backButton: {
      position: "absolute",
      top: 48,
      left: 24,
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 14,
      backgroundColor: "rgba(0,0,0,0.4)",
      borderRadius: 20,
      zIndex: 10,
    },
    backText: {
      ...typography.bodySmall,
      color: colors.text.white,
      marginLeft: 6,
    },
    imageContainer: {
      flex: 1,
      overflow: "hidden",
    },
    image: {
      flex: 1,
      width: "100%",
      resizeMode: "cover",
    },
    textContainer: {
      flex: 1,
      paddingHorizontal: 32,
      justifyContent: "center",
      backgroundColor: colors.body,
    },
    title: {
      ...typography.primaryXl,
      color: colors.text.primary,
      marginBottom: 12,
      textAlign: "center",
    },
    subtitle: {
      ...typography.bodyMedium,
      color: colors.text.muted,
      textAlign: "center",
    },
    buttonWrapper: {
      marginTop: 24,
      alignItems: "center",
    },
    button: {
      backgroundColor: colors.text.primary,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
      marginHorizontal: 40,
      alignSelf: "stretch",
    },
    buttonText: {
      ...typography.buttonLarge,
      color: colors.text.white,
    },
  });

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <FontAwesome5 name="chevron-left" size={16} color={colors.text.white} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* Upper half image */}
      <View style={styles.imageContainer}>
        <ImageBackground
          source={require("../../../assets/onboarding-bg-2.png")}
          style={styles.image}
        />
      </View>

      {/* Lower half text and button */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          Consistency is the key to progress. Don't give up!
        </Text>
        <Text style={styles.subtitle}>
          Your journey starts with a single step. Join us.
        </Text>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Register2")}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
