import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useThemeContext } from "../contexts/ThemeContext";

export const ThemeToggle = () => {
	const { theme, setTheme } = useThemeContext();

	const toggleTheme = () => {
		const newTheme = theme === "dark" ? "light" : "dark";
		setTheme(newTheme);
	};

	return (
		<TouchableOpacity onPress={toggleTheme} style={{ padding: 10 }}>
			<Text style={{ fontSize: 24 }}>{theme === "dark" ? "🌙" : "☀️"}</Text>
		</TouchableOpacity>
	);
};
