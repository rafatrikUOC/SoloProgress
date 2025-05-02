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

	const styles = createStyles(colors, typography);

	StyleSheet.create({
		container: {
			flexGrow: 1,
			padding: 20,
			backgroundColor: colors.body,
		},
		status: {
			fontSize: typography.bodyMedium.fontSize,
			fontFamily: typography.bodyMedium.fontFamily,
			textAlign: "center",
			marginTop: 20,
			color: colors.text.white,
		},
		title: {
			fontSize: typography.screenTitle.fontSize,
			fontFamily: typography.screenTitle.fontFamily,
			fontWeight: "bold",
			marginBottom: 20,
			color: colors.text.white,
		},
		userCard: {
			backgroundColor: colors.card,
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
			color: colors.text.white,
		},
		text: {
			fontSize: typography.bodyMedium.fontSize,
			fontFamily: typography.bodyMedium.fontFamily,
			color: colors.text.white,
		},
		photoUrl: {
			fontSize: typography.bodySmall.fontSize,
			fontFamily: typography.bodySmall.fontFamily,
			color: colors.text.muted,
			marginTop: 10,
			fontStyle: "italic",
		},
		error: {
			color: colors.text.danger,
			fontSize: typography.bodyMedium.fontSize,
			fontFamily: typography.bodyMedium.fontFamily,
			textAlign: "center",
			marginTop: 20,
		},
	});

	if (loading) {
		return (
			<View style={styles.container}>
				<Text style={styles.status}>Cargando usuarios...</Text>
			</View>
		);
	}

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<ThemeSelector />

			{error ? (
				<Text style={styles.error}>Error: {error}</Text>
			) : (
				<>
					<Text style={styles.title}>Usuarios registrados:</Text>

					{users.map((user) => (
						<View key={user.id} style={styles.userCard}>
							<Text style={styles.userName}>{user.name}</Text>
							<Text style={styles.text}>Nickname: {user.nickname}</Text>
							<Text style={styles.text}>Email: {user.email}</Text>
							<Text style={styles.text}>
								Rol: {user.is_trainer ? "Entrenador" : "Alumno"}
							</Text>
							{user.photo_url && (
								<Text style={styles.photoUrl}>
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
