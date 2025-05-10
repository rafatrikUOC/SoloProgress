import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import {
  BackButton,
  ActionButton,
  HeaderBlock,
} from "../../../global/components/UIElements";

const { height: screenHeight } = Dimensions.get("window");

export default function Register1({ navigation }) {
  const { colors, typography } = useThemeContext();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
    },
    headerContainer: {
      height: screenHeight * 0.87,
      width: "100%",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    imageContainer: {
      width: "100%",
      height: "70%",
      overflow: "hidden",
    },
    image: {
      flex: 1,
      width: "100%",
      resizeMode: "cover",
    },
  });

  return (
    <View style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />

      <View style={styles.headerContainer}>
        <View style={styles.imageContainer}>
          <ImageBackground
            source={require("../../../../assets/onboarding-bg-1.png")}
            style={styles.image}
          />
        </View>
        <HeaderBlock
          title="Welcome to the Fitness Journey!"
          subtitle="Your path to a healthier you starts here."
          sx={{
            title: { marginTop: 0 },
          }}
        />
      </View>

      <ActionButton
        text="Continue"
        onPress={() => navigation.navigate("Register2")}
      />
    </View>
  );
}
