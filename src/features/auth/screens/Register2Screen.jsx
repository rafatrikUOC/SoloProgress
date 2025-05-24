import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton, ActionButton, HeaderBlock } from "../../../global/components/UIElements";
import { FontAwesome5 } from "@expo/vector-icons";
import { saveData, getData } from "../../../global/utils/storage"; // Importing storage utils

export default function Register2({ navigation }) {
  const { colors, typography } = useThemeContext();

  // State to store the selected gender
  const [selectedGender, setSelectedGender] = useState(null);

  // Load all previous data (if any) from AsyncStorage
  useEffect(() => {
    const loadPreviousData = async () => {
      const previousData = await getData("registrationData"); // Retrieve previously stored data
      if (previousData?.gender) {
        setSelectedGender(previousData.gender); // Set gender if it exists in previous data
      }
    };

    loadPreviousData();
  }, []);

  // Function to save gender immediately after selection
  const handleGenderSelection = async (gender) => {
    setSelectedGender(gender); // Set the selected gender

    // Get the current registration data
    const previousData = await getData("registrationData");

    // Save the updated data with gender modification
    const updatedData = {
      ...previousData,
      gender, // Update gender field
    };

    // Save to AsyncStorage
    await saveData("registrationData", updatedData);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      paddingHorizontal: 24,
      paddingTop: 64,
      justifyContent: "flex-start",
    },
    genderContainer: {
      flexDirection: "column",
      justifyContent: "center",
      marginBottom: 40,
    },
    genderButton: {
      alignItems: "center",
    },
    textButton: {
      backgroundColor: colors.body,
      marginHorizontal: "auto",
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 32,
      marginTop: 24,
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.text.primary,
    },
    textButtonSelected: {
      backgroundColor: colors.text.primary,
    },
    textButtonLabel: {
      ...typography.bodyLarge,
      color: colors.text.primary,
    },
    textButtonLabelSelected: {
      color: colors.text.white,
      fontWeight: "bold",
    },
    circle: {
      width: 175,
      height: 175,
      borderRadius: 100,
      borderWidth: 3,
      borderColor: colors.text.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    circleSelected: {
      backgroundColor: colors.text.primary,
    },
    genderIcon: {
      color: colors.text.primary,
    },
    genderIconSelected: {
      color: colors.text.white,
    },
    genderLabel: {
      ...typography.bodyLarge,
      color: colors.text.primary,
      marginBottom: 20,
    },
    genderLabelSelected: {
      color: colors.text.primary,
      fontWeight: "bold",
    },
  });

  return (
    <View style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />

      <HeaderBlock
        title={"What's your gender?"}
        subtitle={"To tailor exercises that feel right for you"}
      />

      <View style={styles.genderContainer}>
        {/* Male button */}
        <TouchableOpacity
          style={styles.genderButton}
          onPress={() => handleGenderSelection("male")} // Save immediately when clicked
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.circle,
              selectedGender === "male" && styles.circleSelected,
            ]}
          >
            <FontAwesome5
              name="mars"
              size={100}
              style={[
                styles.genderIcon,
                selectedGender === "male" && styles.genderIconSelected,
              ]}
            />
          </View>
          <Text
            style={[
              styles.genderLabel,
              selectedGender === "male" && styles.genderLabelSelected,
            ]}
          >
            Male
          </Text>
        </TouchableOpacity>

        {/* Female button */}
        <TouchableOpacity
          style={styles.genderButton}
          onPress={() => handleGenderSelection("female")} // Save immediately when clicked
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.circle,
              selectedGender === "female" && styles.circleSelected,
            ]}
          >
            <FontAwesome5
              name="venus"
              size={100}
              style={[
                styles.genderIcon,
                selectedGender === "female" && styles.genderIconSelected,
              ]}
            />
          </View>
          <Text
            style={[
              styles.genderLabel,
              selectedGender === "female" && styles.genderLabelSelected,
            ]}
          >
            Female
          </Text>
        </TouchableOpacity>

        {/* Prefer not to specify button */}
        <TouchableOpacity
          style={[
            styles.textButton,
            selectedGender === "unspecified" && styles.textButtonSelected,
          ]}
          onPress={() => handleGenderSelection("unspecified")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.textButtonLabel,
              selectedGender === "unspecified" && styles.textButtonLabelSelected,
            ]}
          >
            I prefer not to specify
          </Text>
        </TouchableOpacity>

      </View>

      <ActionButton
        text="Continue"
        disabled={!selectedGender}
        onPress={() => navigation.navigate("Register3")} // Simply navigate to next screen
      />
    </View>
  );
}
