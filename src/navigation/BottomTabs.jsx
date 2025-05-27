import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5 } from "@expo/vector-icons";
import { useThemeContext } from "../global/contexts/ThemeContext";
import { getData } from "../global/utils/storage";

import HomeStack from "./WorkoutStack";
import ExercisesStack from "./ExercisesStack";
import RoutinesStack from "./RoutinesStack";
import ProfileStack from "./ProfileStack";

const Tab = createBottomTabNavigator();

const TAB_CONFIG = {
  Home: { component: HomeStack, icon: "home" },
  Exercises: { component: ExercisesStack, icon: "dumbbell" },
  Routines: { component: RoutinesStack, icon: "clipboard-list" },
  Profile: { component: ProfileStack, icon: "user" },
};

// Centralized logic for enabled tabs
function getEnabledTabs({ mustChangePassword }) {
  if (mustChangePassword) return ["Profile"];
  return Object.keys(TAB_CONFIG);
}

// Custom tabBarButton that preserves layout/alignment
function CustomTabBarButton({ enabled, ...props }) {
  if (enabled) {
    return <TouchableOpacity activeOpacity={0.7} {...props} />;
  }
  // Render a non-interactive but aligned button
  return (
    <View
      style={[props.style, { opacity: 1, alignItems: "center", justifyContent: "center" }]}
      pointerEvents="none"
    >
      {props.children}
    </View>
  );
}

export default function BottomTabs() {
  const { colors, typography } = useThemeContext();
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    const checkFlag = async () => {
      const flag = await getData("mustChangePassword");
      setMustChangePassword(!!flag);
    };
    checkFlag();
  }, []);

  const enabledTabs = getEnabledTabs({ mustChangePassword });

  // Styles constant inside the function
  const styles = StyleSheet.create({
    tabBarLabel: (enabled, color) => ({
      fontFamily: typography.fontFamily,
      fontSize: 12,
      color: enabled ? color : colors.text.muted,
    }),
    tabBarButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      opacity: 1,
    },
    tabBarStyle: {
      height: 60,
      paddingBottom: 8,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.text.primary,
    },
  });

  return (
    <Tab.Navigator
      initialRouteName={enabledTabs[0]}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.text.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarIcon: ({ color }) => (
          <FontAwesome5
            name={TAB_CONFIG[route.name].icon}
            size={22}
            color={enabledTabs.includes(route.name) ? color : colors.text.muted}
          />
        ),
        tabBarLabel: ({ color }) => (
          <Text style={styles.tabBarLabel(enabledTabs.includes(route.name), color)}>
            {route.name}
          </Text>
        ),
        tabBarButton: (props) => (
          <CustomTabBarButton enabled={enabledTabs.includes(route.name)} {...props} />
        ),
        tabBarStyle: styles.tabBarStyle,
      })}
    >
      {Object.entries(TAB_CONFIG).map(([name, { component }]) => (
        <Tab.Screen key={name} name={name} component={component} />
      ))}
    </Tab.Navigator>
  );
}
