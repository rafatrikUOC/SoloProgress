import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeContext } from "../services/ThemeContext";

export default function ExercisesScreen() {
	const { colors, typography } = useThemeContext();

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.primaryBg,
			padding: 20,
		},
		title: {
			fontFamily: typography.screenTitle.fontFamily,
			fontSize: 24,
			color: colors.fontText,
			marginBottom: 20,
		},
	});

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Bienvenido a los ejercicios</Text>
			{/* ... más contenido */}
		</View>
	);
}
