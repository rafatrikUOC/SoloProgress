import React, { useEffect, useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { ActionButton } from "../../../global/components/UIElements";
import MuscleIcon from "../../../global/components/MuscleIcon";
import { capitalizeFirstLetter } from "../../../global/components/Normalize";
import { supabase } from "../../../global/services/supabaseService";

// Helper to get color for muscle recovery
function getRecoveryColor(percent) {
    if (percent >= 80) return "#27ae60";
    if (percent >= 50) return "#f1c40f";
    if (percent >= 20) return "#e67e22";
    return "#e74c3c";
}

// Helper to format duration as mm:ss or hh:mm:ss
function formatDuration(secs) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
        return `${h.toString().padStart(2, "0")}:${m
            .toString()
            .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// Main summary screen
export default function WorkoutSummaryScreen({ route, navigation }) {
    const { colors } = useThemeContext();
    const trainingSessionId = route.params?.trainingSessionId;
    const summaryProp = route.params?.summary;

    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(summaryProp || null);

    // Fetch and compute summary if not passed
    useEffect(() => {
        if (summaryProp) {
            setLoading(false);
            return;
        }
        if (!trainingSessionId) return;
        setLoading(true);

        async function fetchSummary() {
            // 1. Fetch session info (start/end time, calories, etc.)
            const { data: session, error: sessionError } = await supabase
                .from("TrainingSessions")
                .select(
                    "start_time, end_time, calories_burned, volume, performance_data"
                )
                .eq("id", trainingSessionId)
                .single();

            if (sessionError || !session) {
                setSummary(null);
                setLoading(false);
                return;
            }

            // 2. Fetch all TrainingExercises for this session
            const { data: trainingExercisesRaw } = await supabase
                .from("TrainingExercises")
                .select("id, exercise_id, volume, one_rep_max")
                .eq("training_id", trainingSessionId);

            const trainingExercises = trainingExercisesRaw || [];

            // 3. Fetch ExerciseSeries for all TrainingExercises
            const trainingExerciseIds = trainingExercises.map((te) => te.id);
            const { data: allSeriesRaw } = await supabase
                .from("ExerciseSeries")
                .select("*")
                .in("training_exercise_id", trainingExerciseIds.length > 0 ? trainingExerciseIds : [-1]);

            const allSeries = allSeriesRaw || [];

            // 4. Fetch Exercises info
            const exerciseIds = trainingExercises.map((te) => te.exercise_id);
            const { data: exercisesRaw } = await supabase
                .from("Exercises")
                .select("id, name, primary_muscle, secondary_muscles, photos")
                .in("id", exerciseIds.length > 0 ? exerciseIds : [-1]);

            const exercises = exercisesRaw || [];

            // 5. Compute target muscles (all unique primary/secondary)
            const musclesWorkedSet = new Set();
            (exercises || []).forEach((ex) => {
                if (ex.primary_muscle) musclesWorkedSet.add(ex.primary_muscle);
                if (Array.isArray(ex.secondary_muscles)) {
                    ex.secondary_muscles.forEach((m) => musclesWorkedSet.add(m));
                } else if (ex.secondary_muscles) {
                    musclesWorkedSet.add(ex.secondary_muscles);
                }
            });
            const mainMuscles = Array.from(musclesWorkedSet);

            // 6. Compute global stats
            let totalSets = 0;
            let totalReps = 0;
            let totalVolume = 0;
            let max1RM = {};
            let completedExercises = [];

            // Map for fast lookup
            const exerciseMap = {};
            (exercises || []).forEach((ex) => (exerciseMap[ex.id] = ex));

            // For each exercise, build its summary
            (trainingExercises || []).forEach((te) => {
                const ex = exerciseMap[te.exercise_id];
                const series = (allSeries || [])
                    .filter(
                        (s) =>
                            s.training_exercise_id === te.id &&
                            s.timestamp // Only completed sets
                    )
                    .sort((a, b) => a.order - b.order);

                if (series.length === 0) return; // Skip if no completed sets

                let exerciseVolume = 0;
                let exerciseMax1RM = null;
                let exerciseSets = 0;
                let exerciseReps = 0;
                let setsDetail = [];

                series.forEach((s) => {
                    exerciseSets += 1;
                    exerciseReps += s.reps || 0;
                    exerciseVolume += (s.reps || 0) * (s.weight || 0);
                    setsDetail.push({
                        reps: s.reps,
                        weight: s.weight,
                        is_warmup: s.is_warmup,
                        order: s.order,
                        oneRM: s.record?.oneRM,
                    });
                    if (s.record && s.record.oneRM) {
                        if (!exerciseMax1RM || s.record.oneRM > exerciseMax1RM) {
                            exerciseMax1RM = s.record.oneRM;
                        }
                        // Also track max1RM globally
                        if (
                            !max1RM[te.exercise_id] ||
                            s.record.oneRM > max1RM[te.exercise_id]
                        ) {
                            max1RM[te.exercise_id] = s.record.oneRM;
                        }
                    }
                });

                completedExercises.push({
                    id: te.exercise_id,
                    name: ex?.name || `Exercise ${te.exercise_id}`,
                    primary_muscle: ex?.primary_muscle,
                    secondary_muscles: ex?.secondary_muscles,
                    photo: Array.isArray(ex?.photos) && ex.photos.length > 0 ? ex.photos[0] : null,
                    sets: exerciseSets,
                    reps: exerciseReps,
                    volume: exerciseVolume,
                    max1RM: exerciseMax1RM,
                    setsDetail,
                });

                totalSets += exerciseSets;
                totalReps += exerciseReps;
                totalVolume += exerciseVolume;
            });

            // 7. Compute duration and calories
            let durationSec = 0;
            if (session.start_time && session.end_time) {
                durationSec =
                    (new Date(session.end_time) - new Date(session.start_time)) / 1000;
            }
            const caloriesBurned =
                session.calories_burned ||
                Math.round((durationSec / 60) * 6); // fallback estimation

            setSummary({
                mainMuscles,
                totalSets,
                totalReps,
                totalVolume,
                durationSec,
                caloriesBurned,
                completedExercises,
            });
            setLoading(false);
        }

        fetchSummary();
    }, [trainingSessionId, summaryProp]);

    // Memo for recoveryMap (stub, always 100%)
    const recoveryMap = useMemo(() => {
        const map = {};
        (summary?.mainMuscles || []).forEach((m) => (map[m] = 100));
        return map;
    }, [summary]);

    // Loading state
    if (loading || !summary) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: colors.body,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <ActivityIndicator size="large" color={colors.text.primary} />
                <Text style={{ color: colors.text.primary, marginTop: 16 }}>
                    Generating summary...
                </Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.body }}>
            <ScrollView
                contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Target muscles section */}
                <Text style={styles.sectionTitle}>Target muscles</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.targetMusclesSlider}
                >
                    {(summary.mainMuscles || []).map((muscle, idx) => {
                        const recovery = recoveryMap[muscle] || 100;
                        return (
                            <View style={styles.muscleCard} key={idx}>
                                <View style={styles.muscleIconWrapper}>
                                    <MuscleIcon muscle={muscle} size={36} zoom={1.1} />
                                </View>
                                <View style={styles.muscleTextWrapper}>
                                    <Text style={styles.muscleName}>
                                        {capitalizeFirstLetter(muscle)}
                                    </Text>
                                    <View
                                        style={[
                                            styles.muscleRecoveryPill,
                                            { borderColor: getRecoveryColor(recovery) },
                                        ]}
                                    >
                                        <Text style={styles.muscleRecoveryText}>
                                            {recovery}%
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>

                {/* Global stats */}
                <Text style={styles.title}>Workout Summary</Text>
                <View style={styles.row}>
                    <MaterialIcons
                        name="timer"
                        size={22}
                        color={colors.text.primary}
                        style={styles.statIcon}
                    />
                    <Text style={styles.label}>Duration:</Text>
                    <Text style={styles.value}>
                        {formatDuration(summary.durationSec)}
                    </Text>
                </View>
                <View style={styles.row}>
                    <MaterialIcons
                        name="local-fire-department"
                        size={22}
                        color={colors.text.primary}
                        style={styles.statIcon}
                    />
                    <Text style={styles.label}>Calories burned:</Text>
                    <Text style={styles.value}>{summary.caloriesBurned} kcal</Text>
                </View>
                <View style={styles.row}>
                    <MaterialIcons
                        name="fitness-center"
                        size={22}
                        color={colors.text.primary}
                        style={styles.statIcon}
                    />
                    <Text style={styles.label}>Total sets:</Text>
                    <Text style={styles.value}>{summary.totalSets}</Text>
                </View>
                <View style={styles.row}>
                    <MaterialIcons
                        name="repeat"
                        size={22}
                        color={colors.text.primary}
                        style={styles.statIcon}
                    />
                    <Text style={styles.label}>Total reps:</Text>
                    <Text style={styles.value}>{summary.totalReps}</Text>
                </View>
                <View style={styles.row}>
                    <MaterialIcons
                        name="bar-chart"
                        size={22}
                        color={colors.text.primary}
                        style={styles.statIcon}
                    />
                    <Text style={styles.label}>Total volume:</Text>
                    <Text style={styles.value}>{summary.totalVolume} kg</Text>
                </View>

                {/* Exercises list */}
                <Text style={styles.subtitle}>Exercises</Text>
                <View style={styles.exerciseListContainer}>
                    {(summary.completedExercises || []).map((ex, idx) => (
                        <View key={ex.id} style={styles.exerciseCard}>
                            <View style={styles.exerciseHeader}>
                                {ex.photo ? (
                                    <Image
                                        source={{ uri: ex.photo }}
                                        style={styles.exerciseImage}
                                    />
                                ) : (
                                    <View style={[styles.exerciseImage, { backgroundColor: "#222" }]} />
                                )}
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.exerciseName}>{ex.name}</Text>
                                    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 2 }}>
                                        {ex.primary_muscle && (
                                            <View style={styles.musclePill}>
                                                <MuscleIcon muscle={ex.primary_muscle} size={16} />
                                                <Text style={styles.musclePillText}>
                                                    {capitalizeFirstLetter(ex.primary_muscle)}
                                                </Text>
                                            </View>
                                        )}
                                        {Array.isArray(ex.secondary_muscles) &&
                                            ex.secondary_muscles.map((m, i) => (
                                                <View style={styles.musclePill} key={i}>
                                                    <MuscleIcon muscle={m} size={16} />
                                                    <Text style={styles.musclePillText}>
                                                        {capitalizeFirstLetter(m)}
                                                    </Text>
                                                </View>
                                            ))}
                                    </View>
                                </View>
                            </View>
                            <View style={styles.exerciseStatsRow}>
                                <Text style={styles.exerciseStat}>
                                    Sets: <Text style={styles.exerciseStatValue}>{ex.sets}</Text>
                                </Text>
                                <Text style={styles.exerciseStat}>
                                    Reps: <Text style={styles.exerciseStatValue}>{ex.reps}</Text>
                                </Text>
                                <Text style={styles.exerciseStat}>
                                    Volume: <Text style={styles.exerciseStatValue}>{ex.volume} kg</Text>
                                </Text>
                                {ex.max1RM && (
                                    <Text style={styles.exerciseStat}>
                                        Max 1RM: <Text style={styles.exerciseStatValue}>{ex.max1RM} kg</Text>
                                    </Text>
                                )}
                            </View>
                            <View style={styles.seriesTable}>
                                <Text style={styles.seriesTableTitle}>Series</Text>
                                <View style={styles.seriesTableHeader}>
                                    <Text style={styles.seriesTableCol}>#</Text>
                                    <Text style={styles.seriesTableCol}>Reps</Text>
                                    <Text style={styles.seriesTableCol}>Weight</Text>
                                    <Text style={styles.seriesTableCol}>Warm-up</Text>
                                </View>
                                {(ex.setsDetail || []).map((s, i) => (
                                    <View style={styles.seriesTableRow} key={i}>
                                        <Text style={styles.seriesTableCol}>{i + 1}</Text>
                                        <Text style={styles.seriesTableCol}>{s.reps}</Text>
                                        <Text style={styles.seriesTableCol}>{s.weight}</Text>
                                        <Text style={styles.seriesTableCol}>{s.is_warmup ? "Yes" : "No"}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
            {/* Done button */}
            <View style={styles.actionButtonWrapper}>
                <ActionButton
                    text="Done"
                    onPress={() => navigation.replace("Home")}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
        marginTop: 10,
        marginBottom: 8,
    },
    targetMusclesSlider: {
        flexDirection: "row",
        marginBottom: 20,
    },
    muscleCard: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 8,
        backgroundColor: "#222",
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 14,
        minWidth: 148,
    },
    muscleIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#111",
        overflow: "hidden",
        marginRight: 12,
    },
    muscleTextWrapper: {
        flex: 1,
        justifyContent: "center",
    },
    muscleName: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 15,
        marginBottom: 2,
    },
    muscleRecoveryPill: {
        alignSelf: "flex-start",
        marginTop: 2,
        paddingVertical: 2,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: "#333",
        borderWidth: 1.5,
    },
    muscleRecoveryText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    title: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 24,
        marginBottom: 16,
        marginTop: 10,
        textAlign: "center",
    },
    subtitle: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
        marginTop: 28,
        marginBottom: 8,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    statIcon: {
        marginRight: 8,
    },
    label: {
        color: "#fff",
        fontSize: 16,
        marginLeft: 4,
        flex: 1,
    },
    value: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    exerciseListContainer: {
        marginBottom: 40,
    },
    exerciseCard: {
        backgroundColor: "#232323",
        borderRadius: 16,
        padding: 16,
        marginBottom: 18,
        elevation: 2,
    },
    exerciseHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    exerciseImage: {
        width: 54,
        height: 54,
        borderRadius: 10,
        marginRight: 14,
        backgroundColor: "#181818",
    },
    exerciseName: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
        marginBottom: 2,
    },
    musclePill: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#333",
        borderRadius: 12,
        paddingVertical: 3,
        paddingHorizontal: 10,
        marginRight: 8,
        marginBottom: 4,
    },
    musclePillText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 13,
        marginLeft: 5,
    },
    exerciseStatsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 10,
        gap: 12,
    },
    exerciseStat: {
        color: "#fff",
        fontSize: 13,
        marginRight: 16,
        marginBottom: 2,
    },
    exerciseStatValue: {
        fontWeight: "bold",
        color: "#fff",
    },
    seriesTable: {
        marginTop: 6,
        borderRadius: 8,
        backgroundColor: "#191919",
        padding: 8,
    },
    seriesTableTitle: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
        marginBottom: 4,
    },
    seriesTableHeader: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#333",
        marginBottom: 2,
        paddingBottom: 2,
    },
    seriesTableRow: {
        flexDirection: "row",
        marginBottom: 1,
    },
    seriesTableCol: {
        color: "#fff",
        fontSize: 13,
        width: 60,
        textAlign: "center",
    },
    actionButtonWrapper: {
        position: "absolute",
        left: 24,
        right: 24,
        bottom: 0,
        zIndex: 10,
    },
});
