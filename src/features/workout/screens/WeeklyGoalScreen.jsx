import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton, ScreenTitle } from "../../../global/components/UIElements";
import { supabase } from "../../../global/services/supabaseService";
import { UserContext } from "../../../global/contexts/UserContext";

const WEEKLY_GOALS = [
  { days: 1, label: "1 day per week" },
  { days: 2, label: "2 days per week" },
  { days: 3, label: "3 days per week" },
  { days: 4, label: "4 days per week" },
  { days: 5, label: "5 days per week" },
  { days: 6, label: "6 days per week" },
  { days: 7, label: "7 days per week" },
];

export default function WeeklyGoalScreen({ navigation }) {
  const { colors, typography } = useThemeContext();
  const { user, refreshUser, setUser } = useContext(UserContext);
  const [selectedDays, setSelectedDays] = useState(null);

  useEffect(() => {
    if (user?.settings?.weekly_goal) {
      setSelectedDays(user.settings.weekly_goal);
    }
  }, [user]);

  const handleSelect = async (goal) => {
    const prevSettings = { ...user.settings };
    // Actualización optimista: actualiza el UserContext inmediatamente
    setSelectedDays(goal.days);
    setUser((prevUser) => ({
      ...prevUser,
      settings: {
        ...prevUser.settings,
        weekly_goal: goal.days,
      },
    }));

    try {
      await supabase
        .from("UserSettings")
        .update({ weekly_goal: goal.days })
        .eq("user_id", user.info.id);
      refreshUser();
    } catch {
      // Si falla, revierte el cambio local
      setSelectedDays(prevSettings.weekly_goal);
      setUser((prevUser) => ({
        ...prevUser,
        settings: prevSettings,
      }));
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      padding: 24,
    },
    optionsContainer: {
      marginTop: 36,
      marginBottom: 32,
    },
    option: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: colors.bg.secondary,
      borderRadius: 16,
      marginBottom: 16,
      elevation: 2,
    },
    optionSelected: {
      backgroundColor: colors.bg.primary,
    },
    optionRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    optionText: {
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenTitle title="Weekly goal" />
        <View style={styles.optionsContainer}>
          {WEEKLY_GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.days}
              onPress={() => handleSelect(goal)}
              style={[
                styles.option,
                selectedDays === goal.days && styles.optionSelected,
              ]}
              activeOpacity={0.9}
            >
              <View style={styles.optionRow}>
                <Text
                  style={[
                    typography.bodyMedium,
                    styles.optionText,
                    {
                      color:
                        selectedDays === goal.days
                          ? colors.text.white
                          : colors.text.primary,
                    },
                  ]}
                >
                  {goal.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
