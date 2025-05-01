import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5 } from "@expo/vector-icons";
import { useThemeContext } from "../services/ThemeContext";

// Import screens
import HomeScreen from "../screens/HomeScreen";
import ExercisesScreen from "../screens/ExercisesScreen";
import RoutinesScreen from "../screens/RoutinesScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
	const { colors, typography } = useThemeContext();

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarActiveTintColor: colors.btnPrimary,
				tabBarInactiveTintColor: colors.fontText,
				tabBarIcon: ({ focused }) => {
					let iconName;
					const iconColor = focused ? colors.btnPrimary : colors.fontText;

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
				tabBarLabelStyle: ({  focused }) => ({
					fontFamily: typography.fontFamily,
					fontSize: 12,
					color: focused ? colors.btnPrimary : colors.fontText,
				}),
				tabBarStyle: {
					height: 60,
					paddingBottom: 8,
					backgroundColor: colors.secondaryBg,
					borderWidth: 1,
					borderColor: colors.border || "transparent",
				},
			})}
		>
			<Tab.Screen name="Home" component={HomeScreen} />
			<Tab.Screen name="Exercises" component={ExercisesScreen} />
			<Tab.Screen name="Routines" component={RoutinesScreen} />
			<Tab.Screen name="Profile" component={ProfileScreen} />
		</Tab.Navigator>
	);
}
