import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorSchemes } from "../styles/colorSchemes";
import { typography } from "../styles/typography";

// Theme configuration
const theme = {
	dark: { colors: colorSchemes.dark, typography },
	light: { colors: colorSchemes.light, typography },
	contrast: { colors: colorSchemes.contrast, typography }
};


// Hook to manage current theme
export const useTheme = () => {
	const [currentTheme, setCurrentTheme] = useState("dark");

	// Load theme from AsyncStorage on component mount
	useEffect(() => {
		const loadTheme = async () => {
			try {
				const savedTheme = await AsyncStorage.getItem("user_theme");
				if (savedTheme && theme[savedTheme]) {
					setCurrentTheme(savedTheme);
				}
			} catch (error) {
				console.error("Error loading theme:", error);
			}
		};
		loadTheme();
	}, []);

	// Change theme
	const setTheme = async (themeName) => {
		if (!theme[themeName]) return;
		try {
			await AsyncStorage.setItem("user_theme", themeName);
			setCurrentTheme(themeName);
		} catch (error) {
			console.error("Error saving theme:", error);
		}
	};

	return {
		theme: currentTheme,
		colors: theme[currentTheme].colors,
		typography: theme[currentTheme].typography,
		setTheme,
	};
};
