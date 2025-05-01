import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useThemeContext } from "../../services/ThemeContext";
import { colorSchemes } from "../../styles/colorSchemes";

// Función para generar nombres amigables
const getFriendlyName = (themeName) => {
	switch (themeName) {
		case "dark":
			return "Modo Oscuro";
		case "light":
			return "Modo Claro";
		case "contrast":
			return "Alto Contraste";
		default:
			return themeName;
	}
};

export const ThemeSelector = () => {
	const { theme, setTheme, colors } = useThemeContext();

	return (
		<View style={styles.container}>
			{Object.keys(colorSchemes).map((key) => (
				<TouchableOpacity
					key={key}
					style={[
						styles.themeOption,
						theme === key && {
							borderBottomColor: colors.btnPrimary,
						},
					]}
					onPress={() => setTheme(key)}
				>
					<View
						style={[
							styles.themePreview,
							{
								backgroundColor: colorSchemes[key].primaryBg,
								borderColor: colorSchemes[key].fontText,
							},
						]}
					>
						<Text style={{ color: colorSchemes[key].fontText }}>Aa</Text>
					</View>
					<Text style={[styles.label, { color: colors.fontText }]}>
						{getFriendlyName(key)}
					</Text>
				</TouchableOpacity>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginBottom: 20,
	},
	themeOption: {
		alignItems: "center",
		padding: 10,
	},
	activeTheme: {
		borderBottomWidth: 2,
		borderBottomColor: "#20B8CD",
	},
	themePreview: {
		width: 50,
		height: 50,
		borderRadius: 25,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		marginBottom: 5,
	},
	label: {
		fontSize: 12,
		marginTop: 5,
	},
});
