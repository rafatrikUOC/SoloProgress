import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useThemeContext } from "../contexts/ThemeContext";

// Botón de volver
export function BackButton({ onPress }) {
	const { colors, typography } = useThemeContext();
	const styles = StyleSheet.create({
		backButton: {
			position: "absolute",
			top: 48,
			left: 24,
			flexDirection: "row",
			alignItems: "center",
			paddingVertical: 6,
			paddingHorizontal: 14,
			backgroundColor: "rgba(0,0,0,0.4)",
			borderRadius: 20,
			zIndex: 10,
		},
		backText: {
			...typography.bodySmall,
			color: colors.text.white,
			marginLeft: 6,
		},
	});

	return (
		<TouchableOpacity style={styles.backButton} onPress={onPress}>
			<FontAwesome5 name="chevron-left" size={16} color={colors.text.white} />
			<Text style={styles.backText}>Back</Text>
		</TouchableOpacity>
	);
}

// Botón de saltar
export function SkipButton({ onPress }) {
	const { colors, typography } = useThemeContext();
	const styles = StyleSheet.create({
		skipButton: {
			position: "absolute",
			top: 48,
			right: 24,
			flexDirection: "row",
			alignItems: "center",
			paddingVertical: 6,
			paddingHorizontal: 14,
			backgroundColor: "rgba(0,0,0,0.4)",
			borderRadius: 20,
			zIndex: 10,
		},
		skipText: {
			...typography.bodySmall,
			color: colors.text.primary,
			marginRight: 6,
		},
	});

	return (
		<TouchableOpacity style={styles.skipButton} onPress={onPress}>
			<Text style={styles.skipText}>Skip</Text>
			<FontAwesome5
				name="chevron-right"
				size={16}
				color={colors.text.primary}
			/>
		</TouchableOpacity>
	);
}

export function ActionButton({ onPress, text, disabled = false }) {
	const { colors, typography } = useThemeContext();
	const styles = StyleSheet.create({
		continueButton: {
			position: "absolute",
			bottom: 40,
			left: 40,
			right: 40,
			backgroundColor: colors.text.primary,
			borderRadius: 10,
			paddingVertical: 14,
			alignItems: "center",
			opacity: disabled ? 0.4 : 1,
		},
		continueButtonText: {
			...typography.buttonLarge,
			color: colors.text.white,
		},
	});

	return (
		<TouchableOpacity
			onPress={onPress}
			disabled={disabled}
			style={styles.continueButton}
			activeOpacity={disabled ? 1 : 0.8}
		>
			<Text style={styles.continueButtonText}>{text}</Text>
		</TouchableOpacity>
	);
}

export function HeaderBlock({ title, subtitle, sx }) {
	const { colors, typography } = useThemeContext();

	const styles = StyleSheet.create({
		title: {
			...typography.primaryXl,
			color: colors.text.primary,
			marginBottom: 8,
			textAlign: "center",
			marginTop: 32,
			...sx?.title,
		},
		subtitle: {
			...typography.bodyMedium,
			color: colors.text.muted,
			marginBottom: 32,
			textAlign: "center",
			...sx?.subtitle,
		},
	});

	return (
		<View style={{ alignItems: "center", marginTop: 32 }}>
			<Text style={styles.title}>{title}</Text>
			<Text style={styles.subtitle}>{subtitle}</Text>
		</View>
	);
}

export function ScreenTitle({ title, sx }) {
	const { colors, typography } = useThemeContext();

	const styles = StyleSheet.create({
		title: {
			...typography.secondaryMd,
			color: colors.text.white,
			marginBottom: 24,
			textAlign: "center",
			marginTop: 32,
			fontWeight: "800",
			...sx?.title,
		},
	});

	return (
		<View style={{ alignItems: "center", marginTop: 32 }}>
			<Text style={styles.title}>{title}</Text>
		</View>
	);
}

// Overlay de fondo oscuro semitransparente
export function Overlay() {
	return (
		<View
			pointerEvents="none"
			style={{
				...StyleSheet.absoluteFillObject,
				backgroundColor: "#00000080",
			}}
		/>
	);
}
