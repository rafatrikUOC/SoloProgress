import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { supabase } from "../services/supabase";
import { useTheme } from "../services/useTheme";
import { ThemeSelector } from "../components/theme/ThemeSelector";

export default function SupabaseTestScreen() {
	const { colors, typography } = useTheme();
	const [loading, setLoading] = useState(true);
	const [users, setUsers] = useState([]);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const { data, error } = await supabase.from("Users").select("*");
				if (error) setError(error.message);
				else setUsers(data);
			} catch (e) {
				setError(e.message);
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, []);

	const dynamicStyles = createStyles(colors, typography);

	if (loading) {
		return (
			<View style={dynamicStyles.container}>
				<Text style={dynamicStyles.status}>Cargando usuarios...</Text>
			</View>
		);
	}

	return (
		<ScrollView contentContainerStyle={dynamicStyles.container}>
			<ThemeSelector />

			{error ? (
				<Text style={dynamicStyles.error}>Error: {error}</Text>
			) : (
				<>
					<Text style={dynamicStyles.title}>Usuarios registrados:</Text>

					{users.map((user) => (
						<View key={user.id} style={dynamicStyles.userCard}>
							<Text style={dynamicStyles.userName}>{user.name}</Text>
							<Text style={dynamicStyles.text}>Nickname: {user.nickname}</Text>
							<Text style={dynamicStyles.text}>Email: {user.email}</Text>
							<Text style={dynamicStyles.text}>
								Rol: {user.is_trainer ? "Entrenador" : "Alumno"}
							</Text>
							{user.photo_url && (
								<Text style={dynamicStyles.photoUrl}>
									Foto: {user.photo_url}
								</Text>
							)}
						</View>
					))}
				</>
			)}
		</ScrollView>
	);
}

// This function creates styles based on the current theme colors and typography
const createStyles = (colors, typography) =>
	StyleSheet.create({
		container: {
			flexGrow: 1,
			padding: 20,
			backgroundColor: colors.primaryBg,
		},
		status: {
			fontSize: typography.bodyMedium.fontSize,
			fontFamily: typography.bodyMedium.fontFamily,
			textAlign: "center",
			marginTop: 20,
			color: colors.fontText,
		},
		title: {
			fontSize: typography.screenTitle.fontSize,
			fontFamily: typography.screenTitle.fontFamily,
			fontWeight: "bold",
			marginBottom: 20,
			color: colors.fontText,
		},
		userCard: {
			backgroundColor: colors.secondaryBg,
			padding: 15,
			borderRadius: 8,
			marginBottom: 15,
			elevation: 2,
		},
		userName: {
			fontSize: typography.cardTitle.fontSize,
			fontFamily: typography.cardTitle.fontFamily,
			fontWeight: "600",
			marginBottom: 5,
			color: colors.fontText,
		},
		text: {
			fontSize: typography.bodyMedium.fontSize,
			fontFamily: typography.bodyMedium.fontFamily,
			color: colors.fontText,
		},
		photoUrl: {
			fontSize: typography.bodySmall.fontSize,
			fontFamily: typography.bodySmall.fontFamily,
			color: colors.textSecondary,
			marginTop: 10,
			fontStyle: "italic",
		},
		error: {
			color: "#FF5252",
			fontSize: typography.bodyMedium.fontSize,
			fontFamily: typography.bodyMedium.fontFamily,
			textAlign: "center",
			marginTop: 20,
		},
	});
