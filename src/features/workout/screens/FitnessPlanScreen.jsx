import React, { useContext, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton, ScreenTitle } from "../../../global/components/UIElements";
import { UserContext } from "../../../global/contexts/UserContext";

export default function FitnessPlanScreen({ navigation }) {
  const { colors } = useThemeContext();
  const { user } = useContext(UserContext);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      padding: 24,
    },
    row: {
      flexDirection: "row",
      marginBottom: 16,
      gap: 16,
    },
    card: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 20,
      paddingLeft: 16,
      paddingRight: 40,
      minHeight: 70,
      position: "relative",
      justifyContent: "center",
    },
    cardTitlePrimary: {
      color: colors.text.primary,
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 2,
    },
    cardSubtitleWhite: {
      color: colors.text.white,
      fontSize: 13,
      fontWeight: "500",
    },
    cardTitleWhite: {
      color: colors.text.white,
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 2,
    },
    cardSubtitleMuted: {
      color: colors.text.muted,
      fontSize: 13,
      fontWeight: "500",
    },
    caretRight: {
      position: "absolute",
      right: 14,
      top: "50%",
      marginTop: 8,
      width: 22,
      height: 22,
      justifyContent: "center",
      alignItems: "center",
    },
    cardContent: {},
  });

  // Show loading if user or user.settings is not loaded yet
  if (!user || !user.settings) {
    return (
      <View style={styles.container}>
        <ScreenTitle title="Fitness plan" />
        <Text style={styles.cardSubtitleMuted}>Loading user data...</Text>
      </View>
    );
  }

  // Build cards using the new user object structure
  const cards = [
    [
      {
        title:
          user.split?.title?.toUpperCase() ||
          "No routine selected",
        subtitle: "Routine",
        style: "primary",
        onPress: "MyRoutines",
      },
    ],
    [
      {
        title: user.settings.fitness_goal || "No goal",
        subtitle: "Fitness goal",
        style: "secondary",
        onPress: "FitnessGoal",
      },
      {
        title: user.settings.weekly_goal
          ? `${user.settings.weekly_goal} days a week`
          : "No weekly goal",
        subtitle: "Weekly goal",
        style: "secondary",
        onPress: "WeeklyGoal",
      },
    ],
    [
      {
        title: user.settings.performance_data.activity_level || "No data",
        subtitle: "Fitness experience",
        style: "secondary",
        onPress: "FitnessExperience",
      },
      {
        title: user.settings.app_preferences.workout_duration
          ? `${user.settings.app_preferences.workout_duration} minutes`
          : "No duration set",
        subtitle: "Workout duration",
        style: "secondary",
        onPress: "WorkoutDuration",
      },      
    ],
    [
      {
        title: "Advanced",
        style: "secondary",
        onPress: "AdvancedSettings",
      }
    ],
  ];

  return (
    <View style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenTitle title="Fitness plan" />
        {cards.map((row, rowIndex) => (
          <View style={styles.row} key={rowIndex}>
            {row.map((card, cardIndex) => (
              <TouchableOpacity
                style={styles.card}
                key={cardIndex}
                activeOpacity={0.8}
                onPress={
                  card.onPress
                    ? () => navigation.navigate(card.onPress)
                    : undefined
                }
              >
                <View style={styles.cardContent}>
                  <Text
                    style={
                      card.style === "primary"
                        ? styles.cardTitlePrimary
                        : styles.cardTitleWhite
                    }
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {card.title}
                  </Text>
                  {!!card.subtitle && (
                    <Text
                      style={
                        card.style === "primary"
                          ? styles.cardSubtitleWhite
                          : styles.cardSubtitleMuted
                      }
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {card.subtitle}
                    </Text>
                  )}
                </View>
                <View style={styles.caretRight}>
                  <FontAwesome5
                    name="caret-right"
                    size={22}
                    color={
                      card.style === "primary"
                        ? colors.text.primary
                        : colors.text.white
                    }
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
