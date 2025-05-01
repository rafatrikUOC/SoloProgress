// components/theme/ThemeToggle.jsx
import React from "react";
import { TouchableOpacity, Text } from "react-native"; // Usa componentes nativos
import { useThemeContext } from "../../services/ThemeContext"; // Importación corregida

export const ThemeToggle = () => {
	const { theme, setTheme } = useThemeContext(); // Usa el contexto

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
