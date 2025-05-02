import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useThemeContext } from "../../services/ThemeContext";

const getFriendlyName = (themeName: string) => {
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

	const themeOptions = ["dark", "light", "contrast"];

	return (
		<View style={styles.container}>
			{themeOptions.map((key) => (
				<TouchableOpacity
					key={key}
					style={[
						styles.themeOption,
						theme === key && { borderBottomColor: colors.text.primary, borderBottomWidth: 2 },
					]}
					onPress={() => setTheme(key)}
				>
					<View
						style={[
							styles.themePreview,
							{
								backgroundColor: colors.body,
								borderColor: colors.text.white,
							},
						]}
					>
						<Text style={{ color: colors.text.white }}>Aa</Text>
					</View>
					<Text style={[styles.label, { color: colors.text.white }]}>
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
