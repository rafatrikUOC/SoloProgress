import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5 } from "@expo/vector-icons";
import { useThemeContext } from "../global/contexts/ThemeContext";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
	const { colors, typography } = useThemeContext();

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarActiveTintColor: colors.text.primary,
				tabBarInactiveTintColor: colors.text.white,
				tabBarIcon: ({ focused }) => {
					let iconName;
					const iconColor = focused ? colors.text.primary : colors.text.white;

					switch (route.name) {
						case "Home":
							iconName = "home";
							break;
						case "Exercises":
							iconName = "dumbbell";
							break;
						case "Routines":
							iconName = "clipboard-list";
							break;
						case "Profile":
							iconName = "user";
							break;
					}

					return <FontAwesome5 name={iconName} size={22} color={iconColor} />;
				},
				tabBarLabelStyle: ({ focused }) => ({
					fontFamily: typography.fontFamily,
					fontSize: 12,
					color: focused ? colors.text.primary : colors.text.muted,
				}),
				tabBarStyle: {
					height: 60,
					paddingBottom: 8,
					backgroundColor: colors.card,
					borderTopWidth: 1,
					borderTopColor: `${colors.border}4D`,
				},
			})}
		>
			{/* <Tab.Screen name="Home" component={require("../features/home/screens/HomeScreen").default} /> */}
			{/* <Tab.Screen name="Exercises" component={require("../features/exercises/screens/ExercisesScreen").default} /> */}
			{/* <Tab.Screen name="Routines" component={require("../features/routines/screens/RoutinesScreen").default} /> */}
			{/* <Tab.Screen name="Profile" component={require("../features/profile/screens/ProfileScreen").default} /> */}
		</Tab.Navigator>
	);
}
