import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeContext } from "../services/ThemeContext";

export default function ProfileScreen() {
	const { colors, typography } = useThemeContext();

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.body,
			padding: 20,
		},
		title: {
			fontFamily: typography.screenTitle.fontFamily,
			fontSize: 24,
			color: colors.text.white,
			marginBottom: 20,
		},
	});

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Bienvenido al perfil</Text>
			{/* ... más contenido */}
		</View>
	);
}
