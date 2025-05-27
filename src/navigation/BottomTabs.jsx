import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5 } from "@expo/vector-icons";
import { useThemeContext } from "../global/contexts/ThemeContext";

import HomeStack from "./WorkoutStack";
import ExercisesStack from "./ExercisesStack";
import RoutinesStack from "./RoutinesStack";
import ProfileStack from "./ProfileStack";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
	const { colors, typography } = useThemeContext();

	return (
		<Tab.Navigator
			initialRouteName="Home"
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
					borderTopColor: colors.text.primary,
				},
			})}
		>
			<Tab.Screen name="Home" component={HomeStack} />
			<Tab.Screen name="Exercises" component={ExercisesStack} />
			<Tab.Screen name="Routines" component={RoutinesStack} />
			<Tab.Screen name="Profile" component={ProfileStack} />
		</Tab.Navigator>
	);
}
