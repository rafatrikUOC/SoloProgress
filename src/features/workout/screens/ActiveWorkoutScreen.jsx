import React, { useState, useContext, useCallback, useEffect, useMemo, useRef } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Image,
    Modal, Pressable, ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { UserContext } from "../../../global/contexts/UserContext";
import { ActionButton, BackButton, ScreenTitle } from "../../../global/components/UIElements";
import MuscleIcon from "../../../global/components/MuscleIcon";
import { capitalizeFirstLetter } from "../../../global/components/Normalize";
import useTrainingSession from "../hooks/useTrainingSession";
import { useFocusEffect } from "@react-navigation/native";
import { fetchExercises } from "../../exercises/services/exerciseService";
import { useExerciseActions } from "../hooks/useExerciseActions";
import { supabase } from "../../../global/services/supabaseService";
import { loadSummary } from "../../workout/services/summaryService";

const DEFAULT_IMAGE = "https://via.placeholder.com/60?text=No+Image";

// Helper to get muscle recovery percent (stub)
function getMuscleRecovery(muscle, recoveryMap = {}) { return 100; }
function getRecoveryColor(percent) {
    if (percent >= 80) return "#27ae60";
    if (percent >= 50) return "#f1c40f";
    if (percent >= 20) return "#e67e22";
    return "#e74c3c";
}
function formatDuration(secs) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const MENU_OPTIONS = [
    { key: "replace", label: "Replace", icon: "swap-horiz" },
    { key: "video", label: "Video & instructions", icon: "play-circle-outline" },
    { key: "notes", label: "Notes", icon: "sticky-note-2" },
    { key: "replace_exclude", label: "Replaced and don't recommend", icon: "swap-horiz", danger: true },
    { key: "remove", label: "Remove from workout", icon: "delete-outline", danger: true },
    { key: "remove_exclude", label: "Remove and don't recommend", icon: "block", danger: true },
];

export default function ActiveWorkoutScreen({ navigation, route }) {
    const { colors } = useThemeContext();
    const { user } = useContext(UserContext);
    const [trainingSessionId, setTrainingSessionId] = useState(route.params?.trainingSessionId || null);
    const [workout, setWorkout] = useState(route.params?.workout || null);
    const [mainMuscles, setMainMuscles] = useState([]);
    const [sessionStarted, setSessionStarted] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState(null);
    const [sessionDuration, setSessionDuration] = useState(0);
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [allExercises, setAllExercises] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);
    const [showFinishModal, setShowFinishModal] = useState(false);
    const recoveryMap = {};

    const timerRef = useRef();

    // Fetch active session if not provided
    useEffect(() => {
        if (trainingSessionId) return;
        async function fetchActiveSession() {
            if (!user?.info?.id) return;
            const { data } = await supabase
                .from("TrainingSessions")
                .select("*")
                .eq("user_id", user.info.id)
                .not("start_time", "is", null)
                .is("end_time", null)
                .order("start_time", { ascending: false })
                .limit(1)
                .single();
            if (data && data.id) {
                setTrainingSessionId(data.id);
            }
        }
        fetchActiveSession();
    }, [trainingSessionId, user?.info?.id]);

    // Fetch session start_time from DB and set timer state
    useEffect(() => {
        if (!trainingSessionId) return;
        let isMounted = true;
        async function fetchSessionStart() {
            const { data, error } = await supabase
                .from("TrainingSessions")
                .select("start_time, end_time")
                .eq("id", trainingSessionId)
                .single();
            if (isMounted && data && data.start_time && !data.end_time) {
                setSessionStarted(true);
                setSessionStartTime(new Date(data.start_time).getTime());
            } else {
                setSessionStarted(false);
                setSessionStartTime(null);
            }
        }
        fetchSessionStart();
        return () => { isMounted = false; };
    }, [trainingSessionId]);

    // Timer effect
    useEffect(() => {
        if (sessionStarted && sessionStartTime) {
            timerRef.current = setInterval(() => {
                setSessionDuration(Math.floor((Date.now() - sessionStartTime) / 1000));
            }, 1000);
            setSessionDuration(Math.floor((Date.now() - sessionStartTime) / 1000));
        } else {
            setSessionDuration(0);
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [sessionStarted, sessionStartTime]);

    // Load training session data
    const {
        trainingExercises,
        loading: loadingSession,
        refetch,
    } = useTrainingSession({
        user,
        workout,
        trainingSessionId,
    });

    const userId = user?.info?.id;
    const {
        excludeExercise,
        replaceExerciseFull,
        removeExerciseFull,
    } = useExerciseActions({ userId, user });

    // Fetch all exercises for enrichment
    useEffect(() => {
        let mounted = true;
        async function fetchAll() {
            let excluded = user?.settings?.performance_data?.excluded_exercises || [];
            const data = await fetchExercises(excluded);
            if (mounted) {
                setAllExercises(data || []);
            }
        }
        fetchAll();
        return () => { mounted = false; };
    }, [user?.settings?.performance_data?.excluded_exercises]);

    useFocusEffect(
        useCallback(() => {
            if (trainingSessionId) refetch();
        }, [refetch, trainingSessionId])
    );

    useEffect(() => {
        async function fetchWorkoutFromSession() {
            if (workout) {
                setMainMuscles(workout.details?.main_muscles || []);
                return;
            }
            if (!trainingSessionId) return;
            const { data: session } = await supabase
                .from("TrainingSessions")
                .select("split_id, session_index")
                .eq("id", trainingSessionId)
                .single();
            if (!session?.split_id || session.session_index === undefined) return;
            const { data: plannedWorkout } = await supabase
                .from("UserPlannedWorkouts")
                .select("*")
                .eq("split_id", session.split_id)
                .eq("session_index", session.session_index)
                .single();
            if (!plannedWorkout) return;
            setWorkout(plannedWorkout);
            setMainMuscles(plannedWorkout.details?.main_muscles || []);
        }
        fetchWorkoutFromSession();
    }, [workout, trainingSessionId]);

    const isReady =
        trainingSessionId &&
        !loadingSession &&
        Array.isArray(trainingExercises) &&
        trainingExercises.length > 0 &&
        Array.isArray(allExercises) &&
        allExercises.length > 0;

    const exercises = useMemo(() => {
        if (!isReady) return [];
        return trainingExercises
            .filter(te => te && te.exercise_id)
            .map(te => {
                const full = allExercises.find(e => e.id === te.exercise_id);
                return { ...full, id: te.exercise_id };
            });
    }, [isReady, trainingExercises, allExercises]);

    const exercisesWithEffectiveSets = useMemo(() => {
        if (!isReady) return [];
        return exercises.filter(ex => {
            const trainingEx = trainingExercises.find(te => te.exercise_id === ex.id);
            return trainingEx && trainingEx.series && trainingEx.series.some(s => !s.is_warmup);
        });
    }, [isReady, exercises, trainingExercises]);

    const handleExerciseInfoPress = (ex) => {
        const trainingEx = trainingExercises.find(te => te.exercise_id === ex.id);
        navigation.navigate("WorkoutExercise", {
            trainingSessionId,
            trainingExerciseId: trainingEx?.id,
            exerciseId: ex.id,
        });
    };

    const handleExerciseImagePress = (ex) => {
        navigation.navigate("Exercise", { exerciseId: ex.id });
    };

    const handleMenuOption = async (option, ex) => {
        setMenuVisible(false);
        setSelectedExercise(null);

        const trainingEx = trainingExercises.find(te => te.exercise_id === ex.id);

        try {
            setActionLoading(true);
            switch (option.key) {
                case "replace":
                    navigation.navigate("ReplaceExercise", {
                        exerciseId: ex.id,
                        trainingSessionId,
                        workoutId: workout?.id,
                        dontRecommend: false,
                        primaryMuscle: ex.primary_muscle,
                        secondaryMuscles: ex.secondary_muscles || [],
                        workoutExercises: exercises
                    });
                    break;
                case "video":
                    navigation.navigate("Exercise", { exerciseId: ex.id });
                    break;
                case "notes":
                    navigation.navigate("ExerciseNotes", {
                        exerciseId: ex.id,
                        trainingExerciseId: trainingEx?.id,
                    });
                    break;
                case "replace_exclude":
                    await excludeExercise(ex.id);
                    navigation.navigate("ReplaceExercise", {
                        exerciseId: ex.id,
                        trainingSessionId,
                        workoutId: workout?.id,
                        dontRecommend: false,
                        primaryMuscle: ex.primary_muscle,
                        secondaryMuscles: ex.secondary_muscles || [],
                        workoutExercises: exercises
                    });
                    break;
                case "remove":
                    await removeExerciseFull({
                        plannedWorkoutId: workout?.id,
                        trainingSessionId,
                        exerciseId: ex.id,
                    });
                    await refetch();
                    break;
                case "remove_exclude":
                    await excludeExercise(ex.id);
                    await removeExerciseFull({
                        plannedWorkoutId: workout?.id,
                        trainingSessionId,
                        exerciseId: ex.id,
                    });
                    await refetch();
                    break;
                default:
                    break;
            }
        } catch (err) {
            console.error("[ActiveWorkoutScreen] Error in menu action:", err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleFinishWorkout = async () => {
        setShowFinishModal(false);
        setActionLoading(true);

        try {
            const summary = await loadSummary(trainingSessionId);

            setSessionStarted(false);
            setSessionStartTime(null);
            setSessionDuration(0);
            setActionLoading(false);

            navigation.replace("WorkoutSummary", {
                trainingSessionId,
                summary,
            });
        } catch (err) {
            setActionLoading(false);
            alert("There was an error saving your workout summary.");
            console.error(err);
        }
    };

    // Styles
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.body,
            padding: 24,
        },
        sectionTitle: {
            color: colors.text.primary,
            fontSize: 18,
            fontWeight: "bold",
            marginTop: 16,
            marginBottom: 12,
        },
        targetMusclesSlider: {
            flexDirection: "row",
            marginBottom: 12,
        },
        muscleCard: {
            flexDirection: "row",
            alignItems: "center",
            marginRight: 8,
            backgroundColor: colors.card,
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
            borderColor: colors.text.white,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.body,
            overflow: "hidden",
            marginRight: 12,
        },
        muscleTextWrapper: {
            flex: 1,
            justifyContent: "center",
        },
        muscleName: {
            color: colors.text.white,
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
            backgroundColor: colors.card,
            borderWidth: 1.5,
        },
        muscleRecoveryText: {
            color: colors.text.white,
            fontSize: 12,
            fontWeight: "bold",
        },
        exercisesCount: {
            color: colors.text.white,
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 8,
        },
        exerciseCard: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            minHeight: 80,
        },
        exerciseImageWrapper: {
            position: "relative",
            marginRight: 14,
        },
        exerciseImage: {
            width: 60,
            height: 60,
            borderRadius: 10,
            backgroundColor: colors.body,
        },
        muscleBadge: {
            position: "absolute",
            right: -8,
            bottom: -8,
            width: 28,
            height: 28,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: colors.text.white,
            backgroundColor: colors.body,
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
        },
        exerciseInfo: {
            flex: 1,
            justifyContent: "center",
            paddingVertical: 4,
            paddingHorizontal: 2,
        },
        exerciseName: {
            color: colors.text.white,
            fontWeight: "bold",
            fontSize: 15,
            marginBottom: 2,
        },
        exerciseDetails: {
            color: colors.text.muted,
            fontSize: 13,
        },
        menuButton: {
            marginLeft: 12,
            padding: 8,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
        },
        // Contextual menu styles (for menuVisible)
        menuOverlayContext: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "flex-end",
        },
        menuModalContext: {
            backgroundColor: colors.card,
            padding: 16,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
        },
        menuOptionContext: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: colors.body,
        },
        menuOptionTextContext: {
            color: colors.text.white,
            fontSize: 16,
            marginLeft: 12,
        },
        menuCancelContext: {
            marginTop: 12,
            alignItems: "center",
        },
        menuCancelTextContext: {
            color: colors.text.muted,
            fontSize: 16,
            fontWeight: "bold",
        },
        // Finish modal styles (for showFinishModal)
        modalOverlay: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
        },
        menuModal: {
            backgroundColor: colors.card,
            padding: 16,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            marginHorizontal: 16,
        },
        modalBtn: {
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 18,
            borderRadius: 12,
            backgroundColor: colors.text.primary,
            alignItems: "center",
            justifyContent: "center",
            minWidth: 90,
            marginHorizontal: 0,
        },
        modalBtnCancel: {
            backgroundColor: colors.card,
            borderWidth: 1.5,
            borderColor: colors.text.primary,
        },
        modalBtnText: {
            color: colors.card,
            fontWeight: "bold",
            fontSize: 16,
            letterSpacing: 0.5,
        },
        modalBtnTextCancel: {
            color: colors.text.primary,
        },
        scrollContent: {
            paddingBottom: 110,
        },
        actionButtonWrapper: {
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 0,
            zIndex: 10,
        },
        actionLoadingOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: colors.body + "CC",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 100,
        },
        actionLoadingText: {
            color: colors.text.primary,
            fontSize: 18,
            marginTop: 12,
        },
        addSetRow: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: 10,
            marginBottom: 10,
            gap: 12,
            position: "relative",
        },
        addSetIconWrapper: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.bg.secondary,
            justifyContent: "center",
            alignItems: "center",
        },
        addSetText: {
            color: colors.text.primary,
            fontWeight: "bold",
            fontSize: 16,
        },
        timerBox: {
            position: "absolute",
            top: 36,
            right: 24,
            backgroundColor: colors.text.primary + "EE",
            borderRadius: 24,
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 6,
            paddingHorizontal: 16,
            elevation: 6,
            shadowColor: "#000",
            shadowOpacity: 0.13,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            zIndex: 100,
        },
        timerIcon: {
            marginRight: 7,
        },
        timerText: {
            color: colors.text.white,
            fontWeight: "bold",
            fontSize: 16,
            letterSpacing: 1.1,
        },
    });

    // Show loading spinner if not ready
    if (!isReady) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color={colors.text.primary} />
                <Text style={{ color: colors.text.primary, marginTop: 16 }}>Loading workout...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <BackButton onPress={() => navigation.goBack()} />

            {/* Action loading overlay */}
            {actionLoading && (
                <View style={styles.actionLoadingOverlay}>
                    <ActivityIndicator size="large" color={colors.text.primary} />
                    <Text style={styles.actionLoadingText}>Applying action...</Text>
                </View>
            )}

            {/* Session timer */}
            {sessionStarted && (
                <View style={styles.timerBox}>
                    <MaterialIcons name="timer" size={32} color={colors.text.card + "99"} style={styles.timerIcon} />
                    <Text style={styles.timerText}>{formatDuration(sessionDuration)}</Text>
                </View>
            )}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <ScreenTitle title={workout?.title || "Active workout"} />

                {/* Target muscles summary */}
                <Text style={styles.sectionTitle}>Target muscles</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.targetMusclesSlider}
                >
                    {mainMuscles.map((muscle, idx) => {
                        const recovery = getMuscleRecovery(muscle, recoveryMap);
                        return (
                            <View style={styles.muscleCard} key={idx}>
                                <View style={styles.muscleIconWrapper}>
                                    <MuscleIcon muscle={muscle} size={36} zoom={1.1} />
                                </View>
                                <View style={styles.muscleTextWrapper}>
                                    <Text style={styles.muscleName}>{capitalizeFirstLetter(muscle)}</Text>
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

                {/* Exercise count */}
                <Text style={styles.exercisesCount}>{exercisesWithEffectiveSets.length} exercises</Text>

                {/* Exercise list with sets x reps summary */}
                {exercises.map((ex, idx) => {
                    const trainingEx = trainingExercises.find(te => te.exercise_id === ex.id);
                    if (!trainingEx || !trainingEx.series || trainingEx.series.length === 0) return null;
                    const effectiveSeries = trainingEx.series.filter(s => !s.is_warmup);
                    const seriesCount = effectiveSeries.length;
                    const repsSet = [...new Set(effectiveSeries.map(s => s.reps))];
                    const repsText = repsSet.length === 1
                        ? `${repsSet[0]} reps`
                        : `${Math.min(...repsSet)}-${Math.max(...repsSet)} reps`;

                    return (
                        <View style={styles.exerciseCard} key={idx}>
                            {/* Exercise image */}
                            <TouchableOpacity
                                style={styles.exerciseImageWrapper}
                                onPress={() => handleExerciseImagePress(ex)}
                                activeOpacity={0.8}
                            >
                                <Image
                                    source={{
                                        uri: Array.isArray(ex.photos) && ex.photos.length > 0
                                            ? ex.photos[0]
                                            : DEFAULT_IMAGE,
                                    }}
                                    style={styles.exerciseImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.muscleBadge}>
                                    <MuscleIcon muscle={ex.primary_muscle || ex.muscle} size={18} />
                                </View>
                            </TouchableOpacity>
                            {/* Exercise info with sets x reps summary */}
                            <TouchableOpacity
                                style={styles.exerciseInfo}
                                onPress={() => handleExerciseInfoPress(ex)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.exerciseName}>{capitalizeFirstLetter(ex.name)}</Text>
                                <Text style={styles.exerciseDetails}>
                                    {seriesCount} x {repsText}
                                </Text>
                            </TouchableOpacity>
                            {/* Menu button */}
                            <TouchableOpacity style={styles.menuButton} onPress={() => {
                                setSelectedExercise(ex);
                                setMenuVisible(true);
                            }}>
                                <MaterialIcons name="more-vert" size={22} color={colors.text.white} />
                            </TouchableOpacity>
                        </View>
                    );
                })}

                {/* Add exercise button */}
                <View style={styles.addSetRow}>
                    <TouchableOpacity
                        style={styles.addSetIconWrapper}
                        onPress={() => navigation.navigate("AddExercise", {
                            trainingSessionId,
                            workoutId: workout?.id,
                            workoutExercises: exercises,
                        })}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="add" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("AddExercise", {
                            trainingSessionId,
                            workoutId: workout?.id,
                            workoutExercises: exercises
                        })}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.addSetText}>Add exercise</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Contextual menu modal for exercise actions */}
            <Modal
                visible={menuVisible}
                transparent
                animationType="slide"
                onRequestClose={() => {
                    setMenuVisible(false);
                    setSelectedExercise(null);
                }}
            >
                <Pressable style={styles.menuOverlayContext} onPress={() => {
                    setMenuVisible(false);
                    setSelectedExercise(null);
                }}>
                    <View style={styles.menuModalContext}>
                        {MENU_OPTIONS.map((option, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={styles.menuOptionContext}
                                onPress={() => {
                                    if (selectedExercise) handleMenuOption(option, selectedExercise);
                                }}
                            >
                                {option.icon && (
                                    <MaterialIcons name={option.icon} size={22} color={option.danger ? colors.text.danger : colors.text.white} />
                                )}
                                <Text
                                    style={[
                                        styles.menuOptionTextContext,
                                        option.danger && { color: colors.text.danger },
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.menuCancelContext}
                            onPress={() => {
                                setMenuVisible(false);
                                setSelectedExercise(null);
                            }}
                        >
                            <Text style={styles.menuCancelTextContext}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            {/* Fixed "Finish workout" button at the bottom */}
            <View style={styles.actionButtonWrapper}>
                <ActionButton
                    text="Finish workout"
                    onPress={() => setShowFinishModal(true)}
                />
            </View>

            {/* Confirm finish modal */}
            <Modal visible={showFinishModal} transparent animationType="fade">
                <Pressable style={styles.modalOverlay} onPress={() => setShowFinishModal(false)}>
                    <Pressable style={styles.menuModal} onPress={e => e.stopPropagation()}>
                        <Text style={{ color: colors.text.white, fontWeight: "bold", fontSize: 20, marginBottom: 16, textAlign: "center" }}>
                            Are you sure you want to finish the workout?
                        </Text>
                        <View style={{ flexDirection: "row", marginTop: 18, gap: 18 }}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnCancel]}
                                onPress={() => setShowFinishModal(false)}
                            >
                                <Text style={[styles.modalBtnText, styles.modalBtnTextCancel]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalBtn}
                                onPress={handleFinishWorkout}
                            >
                                <Text style={styles.modalBtnText}>Finish</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
