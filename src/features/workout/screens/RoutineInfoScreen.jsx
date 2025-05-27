import React, { useEffect, useState, useContext } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import {
	BackButton,
	ScreenTitle,
	ActionButton,
} from "../../../global/components/UIElements";
import MuscleIcon from "../../../global/components/MuscleIcon";
import { supabase } from "../../../global/services/supabaseService";
import { UserContext } from "../../../global/contexts/UserContext";
import { capitalizeFirstLetter } from "../../../global/components/Normalize";

export default function RoutineInfoScreen({ navigation, route }) {
	const { colors, typography } = useThemeContext();
	const split_id = route.params?.split_id ?? 1; // Default to 1 if not provided
	const [split, setSplit] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isUpdated, setIsUpdated] = useState(false);
	const [locallySelected, setLocallySelected] = useState(false);
	const { user, refreshUser } = useContext(UserContext);

	const isSelected = user?.split?.id === split?.id;

	const handleSelectRoutine = async () => {
		if (!user?.info?.id || !split?.id || isSelected || isUpdating || isUpdated) return;

		setIsUpdating(true);
		setLocallySelected(true);
		try {
			// 1. Update in supabase
			const { error } = await supabase
				.from("UserSettings")
				.update({ selected_routine: split.id })
				.eq("user_id", user.info.id);

			if (error) throw error;

			// 2. Refresh user data
			refreshUser();

			// 3. Show feedback
			setIsUpdated(true);
		} catch (error) {
			setLocallySelected(false);
			console.error('Error selecting routine:', error);
		}
	};

	useEffect(() => {
		const fetchSplit = async () => {
			setLoading(true);
			const { data, error } = await supabase
				.from("TrainingSplits")
				.select("*")
				.eq("id", split_id)
				.single();
			setSplit(data);
			setLoading(false);
		};
		if (split_id) fetchSplit();
	}, [split_id]);

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.body,
			padding: 24,
		},
		card: {
			backgroundColor: colors.card,
			borderRadius: 12,
			padding: 18,
			marginBottom: 18,
		},
		cardTitle: {
			color: colors.text.white,
			...typography.primaryMd,
			fontWeight: "bold",
			marginBottom: 6,
			textAlign: "left",
		},
		cardText: {
			color: colors.text.muted,
			...typography.primarySm,
			textAlign: "left",
		},
		routineDataCard: {
			backgroundColor: colors.card,
			borderRadius: 12,
			marginBottom: 18,
			overflow: "hidden",
		},
		routineDataGrid: {
			flexDirection: "row",
			flexWrap: "wrap",
			// No border around the grid
		},
		routineDataCell: {
			width: "50%",
			height: 80,
			justifyContent: "center",
			alignItems: "center",
			borderColor: colors.border || colors.text.muted,
			padding: 8,
		},
		routineDataCellTop: {
			borderBottomWidth: 0.2,
		},
		routineDataCellLeft: {
			borderRightWidth: 0.2,
		},
		routineDataValue: {
			color: colors.text.white,
			...typography.primarySm,
			fontWeight: "bold",
			marginBottom: 2,
			textAlign: "center",
		},
		routineDataLabel: {
			color: colors.text.muted,
			...typography.primarySm,
			textAlign: "center",
		},
		sectionTitle: {
			color: colors.text.white,
			fontWeight: "bold",
			fontSize: 18,
			marginBottom: 12,
			marginTop: 20,
		},
		workoutCard: {
			backgroundColor: colors.card,
			borderRadius: 12,
			padding: 16,
			marginBottom: 14,
		},
		workoutDay: {
			color: colors.text.white,
			...typography.primaryLg,
			fontWeight: "bold",
			marginBottom: 4,
			textAlign: "left",
		},
		muscleIconsRow: {
			flexDirection: "row",
			alignItems: "center",
			marginBottom: 6,
		},
		musclesText: {
			color: colors.text.muted,
			...typography.primaryBase,
			marginBottom: 2,
			textAlign: "left",
		},
		optionalText: {
			color: colors.text.muted,
			...typography.primaryXs,
			fontStyle: "italic",
			textAlign: "left",
		},
		actionButtonWrapper: {
			position: "absolute",
			left: 24,
			right: 24,
			bottom: 0, // Aumenté este valor para separarlo del borde inferior
			zIndex: 10,
		  },
	});

	if (loading) {
		return (
			<View style={styles.container}>
				<ActivityIndicator color={colors.text.primary} size="large" />
			</View>
		);
	}

	if (!split) {
		return (
			<View style={styles.container}>
				<Text style={styles.cardText}>Routine not found.</Text>
			</View>
		);
	}

	// Parse level and workouts if needed
	const level = Array.isArray(split.level)
		? split.level.join(", ")
		: split.level;
	// If workouts is a stringified JSON, parse it
	let workouts = [];
	if (Array.isArray(split.workouts)) {
		workouts = split.workouts;
	} else if (typeof split.workouts === "string") {
		try {
			workouts = JSON.parse(split.workouts);
		} catch {
			workouts = [];
		}
	}

	return (
		<View style={styles.container}>
			<BackButton onPress={() => navigation.goBack()} />
			<ScrollView 
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 70 }}
				>
				<ScreenTitle title={split.title || "Routine"} />

				{/* Card 1: Routine info */}
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Routine info</Text>
					<Text style={styles.cardText}>
						{split.description || "No description available."}
					</Text>
				</View>

				{/* Card 2: Routine data */}
				<View style={styles.routineDataCard}>
					<View style={styles.routineDataGrid}>
						<View
							style={[
								styles.routineDataCell,
								styles.routineDataCellTop,
								styles.routineDataCellLeft,
							]}
						>
							<Text style={styles.routineDataValue}>
								{split.duration || "-"}
							</Text>
							<Text style={styles.routineDataLabel}>Duration</Text>
						</View>
						<View style={[styles.routineDataCell, styles.routineDataCellTop]}>
							<Text style={styles.routineDataValue}>
								{split.days_per_week || "-"}
							</Text>
							<Text style={styles.routineDataLabel}>Days per week</Text>
						</View>
						<View style={[styles.routineDataCell, styles.routineDataCellLeft]}>
							<Text style={styles.routineDataValue}>
								{split.sessions || "-"}
							</Text>
							<Text style={styles.routineDataLabel}>Sessions</Text>
						</View>
						<View style={styles.routineDataCell}>
							<Text style={styles.routineDataValue}>{level || "-"}</Text>
							<Text style={styles.routineDataLabel}>Level</Text>
						</View>
					</View>
				</View>

				{/* Workouts Section */}
				<Text style={styles.sectionTitle}>Workouts</Text>
				{workouts.length === 0 && (
					<Text style={styles.cardText}>No workouts available.</Text>
				)}
				{workouts.map((workout, idx) => (
					<View style={styles.workoutCard} key={idx}>
						<View style={styles.muscleIconsRow}>
							{(workout.main_muscles || []).map((muscle, i) => (
								<View
									key={i}
									style={{
										borderWidth: 0.5,
										borderColor: colors.text.white,
										borderRadius: 100,
										backgroundColor: colors.body,
										width: 38,
										height: 38,
										justifyContent: "center",
										alignItems: "center",
										marginLeft: i === 0 ? 0 : -8,
										zIndex: i + 1,
									}}
								>
									<MuscleIcon
										muscle={muscle}
										size={24}
										color={colors.primary}
									/>
								</View>
							))}
						</View>
						<Text style={styles.workoutDay}>
							{workout.name || `Day ${idx + 1}`}
						</Text>
						<Text style={styles.musclesText}>
							{(workout.main_muscles || [])
								.map((muscle) => capitalizeFirstLetter(muscle))
								.join(", ")}
						</Text>
						{workout.optional_muscles &&
							workout.optional_muscles.length > 0 && (
								<Text style={styles.optionalText}>
									Optional:{" "}
									{(workout.optional_muscles || [])
										.map((muscle) => capitalizeFirstLetter(muscle))
										.join(", ")}
								</Text>
							)}
					</View>
				))}
			</ScrollView>
			{/* Action Button */}
			<View style={styles.actionButtonWrapper}>
				<ActionButton
					text={
						isSelected ? "Selected" : isUpdating ? "Processing..." : "Select"
					}
					disabled={isSelected || isUpdating}
					onPress={handleSelectRoutine}
				/>
			</View>
		</View>
	);
}
