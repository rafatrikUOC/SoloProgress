import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableWithoutFeedback,
} from "react-native";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { SkipButton, Overlay } from "../../../global/components/UIElements";
import { clearData } from "../../../global/utils/storage";

export default function Onboarding1({ navigation }) {
  const { colors, typography } = useThemeContext();

  // Clear the registrationData from AsyncStorage when the component mounts
  useEffect(() => {
    clearData("registrationData"); // Remove the registrationData from AsyncStorage
  }, []);

  const styles = StyleSheet.create({
    background: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.body,
    },
    title: {
      ...typography.screenTitle,
      color: colors.text.muted,
    },
    logo1: {
      ...typography.launchTitle,
      color: colors.text.primary,
      fontWeight: "800",
    },
    logo2: {
      ...typography.launchTitle,
      color: colors.text.primaryHover,
      fontWeight: "400",
    },
    subtitle: {
      ...typography.launchSubtitle,
      color: colors.text.muted,
      fontStyle: "italic",
    },
    centered: {
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <TouchableWithoutFeedback
      onPress={() => navigation.navigate("Onboarding2")}
    >
      <ImageBackground
        source={require("../../../../assets/onboarding-bg-1.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <Overlay />

        <SkipButton onPress={() => navigation.navigate("Auth")} />

        <View style={styles.centered}>
          <Text style={styles.title}>Welcome to</Text>
          <Text>
            <Text style={styles.logo1}>Solo</Text>
            <Text style={styles.logo2}>Progress</Text>
          </Text>
          <Text style={styles.subtitle}>Arise from the weak</Text>
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}
