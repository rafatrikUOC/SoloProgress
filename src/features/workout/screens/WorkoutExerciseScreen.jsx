import React, { useEffect, useState, useRef, useContext } from "react";
import {
    View, Text, TouchableOpacity, Image, TextInput, ActivityIndicator, StyleSheet, Dimensions, Animated, Easing
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { supabase } from "../../../global/services/supabaseService";
import { fetchExerciseById, saveNote } from "../../exercises/services/exerciseService";
import { BackButton } from "../../../global/components/UIElements";
import { capitalizeFirstLetter } from "../../../global/components/Normalize";
import { CustomTimerModal, getRestTime } from "../components/CustomTimerModal";
import { UserContext } from "../../../global/contexts/UserContext";
import MiniTimer from "../components/MiniTimer";

const DEFAULT_IMAGE = "https://via.placeholder.com/400x250?text=No+Image";
const SCREEN_WIDTH = Dimensions.get("window").width;

const COLUMN_LABELS = {
    set: "SET",
    reps: "REPS",
    totalKg: "TOTAL KG",
};

function formatSeconds(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getSeriesUniqueKey(s) {
    return `${s.training_exercise_id}_${s.order}_${s.is_warmup ? 1 : 0}`;
}

function calculate1RM(reps, weight) {
    reps = Number(reps);
    weight = Number(weight);
    if (!reps || !weight) return null;
    return Math.round(weight * (1 + reps / 30));
}

export default function WorkoutExerciseScreen({ navigation, route }) {
    const { colors } = useThemeContext();
    const { trainingExerciseId, exerciseId, trainingSessionId } = route.params;
    const [exercise, setExercise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [series, setSeries] = useState([]);
    const [collapsedWarmup, setCollapsedWarmup] = useState(false);
    const [note, setNote] = useState("");
    const [lastLog, setLastLog] = useState(null);
    const [addMenuVisible, setAddMenuVisible] = useState(false);
    const [focusedCell, setFocusedCell] = useState({});
    const [completedSets, setCompletedSets] = useState({});
    const [timerModalVisible, setTimerModalVisible] = useState(false);

    // Inline timer for set completion
    const [inlineTimerVisible, setInlineTimerVisible] = useState(false);
    const [inlineTimerValue, setInlineTimerValue] = useState(0);
    const [timerResetSignal, setTimerResetSignal] = useState(0);
    const inlineTimerInterval = useRef(null);

    const { user } = useContext(UserContext);

    // For animated collapse
    const warmupAnim = useRef(new Animated.Value(1)).current;
    const autoCollapsedRef = useRef(false);

    // Only allow marking sets if session is started
    const sessionStarted = !!trainingSessionId;

    // Fetch exercise, series, and note data
    useEffect(() => {
        let mounted = true;
        async function fetchAll() {
            setLoading(true);
            try {
                const ex = await fetchExerciseById(exerciseId);
                if (mounted) setExercise(ex);

                const { data: allSeries } = await supabase
                    .from("ExerciseSeries")
                    .select("*")
                    .eq("training_exercise_id", trainingExerciseId)
                    .order('"order"', { ascending: true });
                if (mounted) {
                    setSeries(allSeries || []);
                    const completed = {};
                    (allSeries || []).forEach(s => {
                        const key = getSeriesUniqueKey(s);
                        completed[key] = !!s.timestamp;
                    });
                    setCompletedSets(completed);
                }

                const { data: teData } = await supabase
                    .from("TrainingExercises")
                    .select("performance_data")
                    .eq("id", trainingExerciseId)
                    .single();
                if (mounted) setNote(teData?.performance_data?.notes || "");

                const { data: lastSeries } = await supabase
                    .from("ExerciseSeries")
                    .select("*, training_exercise_id, TrainingExercises!inner(timestamp)")
                    .eq("TrainingExercises.exercise_id", exerciseId)
                    .order("TrainingExercises.timestamp", { ascending: false })
                    .limit(1)
                    .single();
                if (mounted && lastSeries) setLastLog(lastSeries);
            } catch (e) {
                if (mounted) setExercise(null);
            }
            setLoading(false);
        }
        fetchAll();
        return () => { mounted = false; };
    }, [exerciseId, trainingExerciseId]);

// Animate collapse/expand of warm-up section
useEffect(() => {
    Animated.timing(warmupAnim, {
        toValue: collapsedWarmup ? 0 : 1,
        duration: 350,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
    }).start();
}, [collapsedWarmup]);

// Auto-collapse warm-up sets when all are completed
useEffect(() => {
    const warmupSets = series.filter(s => s.is_warmup);
    if (
        warmupSets.length > 0 &&
        warmupSets.every(s => completedSets[getSeriesUniqueKey(s)]) &&
        !collapsedWarmup &&
        !autoCollapsedRef.current
    ) {
        setCollapsedWarmup(true);
        autoCollapsedRef.current = true;
    }
    if (warmupSets.some(s => !completedSets[getSeriesUniqueKey(s)])) {
        autoCollapsedRef.current = false;
    }
}, [completedSets, series, collapsedWarmup]);
// 
// Save note to performance_data after editing
useEffect(() => {
    if (!exerciseId || note === undefined) return;
    const timeout = setTimeout(async () => {
        await saveNote(trainingExerciseId, note);
    }, 600);
    return () => clearTimeout(timeout);
}, [note, trainingExerciseId, exerciseId]);

// Handle input changes for reps/weight and update DB
const handleSeriesChange = async (seriesKey, field, value) => {
    if (!/^\d{0,5}(\.\d{0,2})?$/.test(value)) return;
    setSeries(prev =>
        prev.map(s =>
            getSeriesUniqueKey(s) === seriesKey ? { ...s, [field]: value } : s
        )
    );
    const realSeries = series.find(s => getSeriesUniqueKey(s) === seriesKey);
    if (realSeries) {
        let updateObj = { [field]: value === "" ? null : Number(value) };
        // If set is completed, update timestamp and record (1RM)
        if (completedSets[seriesKey]) {
            updateObj.timestamp = new Date().toISOString();
            const reps = field === "reps" ? value : realSeries.reps;
            const weight = field === "weight" ? value : realSeries.weight;
            const oneRM = calculate1RM(reps, weight);
            updateObj.record = oneRM ? { oneRM } : null;
        }
        await supabase
            .from("ExerciseSeries")
            .update(updateObj)
            .eq("training_exercise_id", realSeries.training_exercise_id)
            .eq('"order"', realSeries.order)
            .eq("is_warmup", realSeries.is_warmup);
    }
};

// Delete a set
const handleDeleteSeries = async (seriesKey) => {
    const realSeries = series.find(s => getSeriesUniqueKey(s) === seriesKey);
    if (realSeries) {
        const { error } = await supabase.from("ExerciseSeries")
            .delete()
            .eq("training_exercise_id", realSeries.training_exercise_id)
            .eq('"order"', realSeries.order)
            .eq("is_warmup", realSeries.is_warmup);
        setSeries(series.filter(s => getSeriesUniqueKey(s) !== seriesKey));
    }
};

// Add a new set (warmup or effective)
const handleAddSet = async (isWarmup) => {
    const group = series.filter(s => s.is_warmup === isWarmup);
    const maxOrder = group.length ? Math.max(...group.map(s => s.order)) : 0;
    const { data, error } = await supabase.from("ExerciseSeries").insert([{
        training_exercise_id: trainingExerciseId,
        order: maxOrder + 1,
        is_warmup: isWarmup,
        reps: 10,
        weight: 10,
    }]).select().single();
    if (!error && data) setSeries([...series, data]);
};

// Show inline timer when a set is completed
function showInlineTimer() {
    const restTime = getRestTime(user, exercise) || 60;
    setInlineTimerValue(restTime);
    setInlineTimerVisible(true);
    setTimerResetSignal(prev => prev + 1);
}

// Toggle set completion, update DB with timestamp and record (1RM)
const toggleSetCompleted = async (seriesKey) => {
    if (!sessionStarted) return;
    const realSeries = series.find(s => getSeriesUniqueKey(s) === seriesKey);
    const isCurrentlyCompleted = !!completedSets[seriesKey];

    setCompletedSets(prev => ({
        ...prev,
        [seriesKey]: !isCurrentlyCompleted
    }));

    if (!realSeries) return;

    if (!isCurrentlyCompleted) {
        const oneRM = calculate1RM(realSeries.reps, realSeries.weight);
        await supabase
            .from("ExerciseSeries")
            .update({
                timestamp: new Date().toISOString(),
                record: oneRM ? { oneRM } : null,
            })
            .eq("training_exercise_id", realSeries.training_exercise_id)
            .eq('"order"', realSeries.order)
            .eq("is_warmup", realSeries.is_warmup);
        showInlineTimer();
    } else {
        await supabase
            .from("ExerciseSeries")
            .update({
                timestamp: null,
                record: null,
            })
            .eq("training_exercise_id", realSeries.training_exercise_id)
            .eq('"order"', realSeries.order)
            .eq("is_warmup", realSeries.is_warmup);
    }
};


// Clear timer on unmount
useEffect(() => {
    return () => {
        if (inlineTimerInterval.current) clearInterval(inlineTimerInterval.current);
    };
}, []);

// Render the swipeable delete action
const renderRightActions = (progress, dragAnimatedValue) => {
    const opacity = dragAnimatedValue.interpolate({
        inputRange: [-60, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });
    return (
        <View style={styles.deleteAction}>
            <Animated.View style={{ opacity, alignItems: "center", justifyContent: "center", flex: 1, marginRight: 13 }}>
                <MaterialIcons name="delete" size={32} color="#fff" />
            </Animated.View>
        </View>
    );
};

// Render column headers
const renderHeaders = () => (
    <View style={styles.pillRow}>
        <View style={styles.pillColSet}><Text style={styles.pillHeader}>{COLUMN_LABELS.set}</Text></View>
        <View style={styles.pillColInput}><Text style={styles.pillHeader}>{COLUMN_LABELS.reps}</Text></View>
        <View style={[styles.pillColInput, styles.pillColLast]}><Text style={styles.pillHeader}>{COLUMN_LABELS.totalKg}</Text></View>
    </View>
);

// Render a single set row
const renderSetRow = (s, idx, isWarmup) => {
    const uniqueKey = getSeriesUniqueKey(s);
    const isCompleted = !!completedSets[uniqueKey];
    return (
        <Swipeable
            key={uniqueKey}
            friction={2}
            leftThreshold={80}
            rightThreshold={40}
            renderRightActions={renderRightActions}
            onSwipeableOpen={() => handleDeleteSeries(uniqueKey)}
        >
            <View style={[
                styles.pillRow,
                isCompleted && sessionStarted && styles.pillRowCompleted
            ]}>
                {/* SET NUMBER */}
                <View style={styles.pillColSet}>
                    <TouchableOpacity
                        style={[
                            styles.pill,
                            isCompleted && sessionStarted && styles.pillCompleted
                        ]}
                        onPress={() => sessionStarted && toggleSetCompleted(uniqueKey)}
                        activeOpacity={sessionStarted ? 0.7 : 1}
                    >
                        <Text
                            style={[
                                styles.pillText,
                                isCompleted && sessionStarted && styles.pillTextCompleted
                            ]}>
                            {idx + 1}
                        </Text>
                    </TouchableOpacity>
                </View>
                {/* REPS */}
                <View style={styles.pillColInput}>
                    <TextInput
                        style={[
                            styles.pillInput,
                            isCompleted && sessionStarted && styles.pillCompletedInput
                        ]}
                        keyboardType="numeric"
                        value={String(s.reps)}
                        onFocus={() => setFocusedCell({ seriesId: uniqueKey, field: "reps" })}
                        onBlur={() => setFocusedCell({})}
                        onChangeText={val => handleSeriesChange(uniqueKey, "reps", val)}
                        placeholder="0"
                        placeholderTextColor={colors.text.muted}
                        editable={true}
                        maxLength={5}
                        textAlign="center"
                    />
                </View>
                {/* TOTAL KG */}
                <View style={[styles.pillColInput, styles.pillColLast]}>
                    <TextInput
                        style={[
                            styles.pillInput,
                            isCompleted && sessionStarted && styles.pillCompletedInput
                        ]}
                        keyboardType="numeric"
                        value={String(s.weight)}
                        onFocus={() => setFocusedCell({ seriesId: uniqueKey, field: "weight" })}
                        onBlur={() => setFocusedCell({})}
                        onChangeText={val => handleSeriesChange(uniqueKey, "weight", val)}
                        placeholder="0"
                        placeholderTextColor={colors.text.muted}
                        editable={true}
                        maxLength={6}
                        textAlign="center"
                    />
                </View>
            </View>
        </Swipeable>
    );
};

// Split series into warmup and effective sets
const warmupSets = series.filter(s => s.is_warmup);
const effectiveSets = series.filter(s => !s.is_warmup);

const PILL_GAP = 10;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.body },
    imageWrapper: { width: SCREEN_WIDTH, aspectRatio: 1.3, backgroundColor: "#222" },
    exerciseImage: { width: "100%", height: "100%", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
    gradientOverlay: {
        position: "absolute",
        left: 0, right: 0, bottom: 0, height: 90,
        width: "100%",
        justifyContent: "flex-end",
    },
    exerciseName: {
        position: "absolute",
        bottom: 16,
        left: 18,
        color: colors.text.white,
        fontSize: 26,
        fontWeight: "bold",
        zIndex: 2,
        textShadowColor: "#0009",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    content: {
        paddingHorizontal: 18,
        paddingTop: 8,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 18,
        marginBottom: 16,
    },
    iconButton: {
        alignItems: "center",
        marginHorizontal: 12,
    },
    iconButtonText: {
        color: colors.text.white,
        fontWeight: "bold",
        fontSize: 14,
        marginTop: 4,
        textAlign: "center",
    },
    sectionHeader: { marginTop: 30, marginBottom: 5, fontWeight: "bold", fontSize: 18, color: colors.text.white },

    pillRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        marginBottom: 4,
    },
    pillRowCompleted: {
        backgroundColor: "transparent",
    },
    pillColSet: {
        flex: 0,
        width: 54,
        alignItems: "center",
        justifyContent: "center",
        marginRight: PILL_GAP,
    },
    pillColInput: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginRight: PILL_GAP,
    },
    pillColLast: {
        marginRight: 0,
    },
    pillHeader: {
        minWidth: 48,
        maxWidth: 120,
        width: "100%",
        textAlign: "center",
        fontWeight: "bold",
        color: colors.text.white,
        fontSize: 13,
        letterSpacing: 1.1,
    },
    pill: {
        minWidth: 48,
        maxWidth: 70,
        width: "100%",
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: colors.text.white,
        color: colors.text.secondary,
        fontWeight: "bold",
        fontSize: 16,
        textAlign: "center",
    },
    pillCompleted: {
        backgroundColor: colors.text.primary,
        color: colors.text.white,
    },
    pillCompletedInput: {
        backgroundColor: colors.text.primary,
        color: colors.text.white,
    },
    pillDisabled: {
        opacity: 0.5,
    },
    pillTextCompleted: {
        color: colors.text.white,
    },
    pillText: {
        color: colors.text.secondary,
        fontWeight: "bold",
        fontSize: 16,
        textAlign: "center",
    },
    pillInput: {
        minWidth: 70,
        maxWidth: 120,
        width: "100%",
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: colors.text.white,
        color: colors.text.secondary,
        fontWeight: "bold",
        fontSize: 16,
        textAlign: "center",
    },
    deleteAction: {
        backgroundColor: colors.text.danger || "#e74c3c",
        justifyContent: "center",
        alignItems: "flex-end",
        width: 60,
        height: "90 %",
        borderRadius: 16,
        marginBottom: 6,
        marginRight: 10,
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
    addSetMenu: {
        position: "absolute",
        top: 44,
        left: 0,
        backgroundColor: colors.card,
        borderRadius: 10,
        elevation: 6,
        zIndex: 100,
        flexDirection: "column",
        minWidth: 160,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    addSetMenuItem: {
        padding: 16,
    },
    addSetMenuText: {
        color: colors.text.primary,
        fontWeight: "bold",
    },
    noteInput: { backgroundColor: colors.card, color: colors.text.primary, borderRadius: 10, padding: 10, minHeight: 60, marginTop: 20 },
    lastLog: { color: colors.text.muted, fontSize: 13, marginTop: 16, textAlign: "center" },
    warmupHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 2,
        marginTop: 14,
    },
    warmupToggle: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 24,
    },
    warmupToggleText: {
        color: colors.text.primary,
        fontWeight: "bold",
        fontSize: 15,
        marginLeft: 4,
    },
    // Inline timer styles
    inlineTimer: {
        position: "absolute",
        bottom: 30,
        right: 24,
        backgroundColor: colors.text.primary,
        borderRadius: 32,
        paddingVertical: 10,
        paddingHorizontal: 22,
        flexDirection: "row",
        alignItems: "center",
        elevation: 6,
        zIndex: 1000,
    },
    inlineTimerText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
    },
    inlineTimerClose: {
        marginLeft: 8,
    }
});

if (loading) {
    return (
        <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
            <ActivityIndicator size="large" color={colors.text.primary} />
            <Text style={{ color: colors.text.primary, marginTop: 16 }}>Loading...</Text>
        </View>
    );
}

return (
    <View style={styles.container}>
        <KeyboardAwareScrollView
            contentContainerStyle={{ paddingBottom: 80 }}
            extraScrollHeight={100}
            enableOnAndroid
            keyboardShouldPersistTaps="handled"
        >
            {/* IMAGE + GRADIENT + NAME */}
            <View style={styles.imageWrapper}>
                <Image
                    source={{ uri: exercise?.image || exercise?.photos?.[0] || DEFAULT_IMAGE }}
                    style={styles.exerciseImage}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={[colors.body + "FF", colors.body + "00"]}
                    style={styles.gradientOverlay}
                    start={{ x: 0.5, y: 1 }}
                    end={{ x: 0.5, y: 0 }}
                >
                    <Text style={styles.exerciseName}>{capitalizeFirstLetter(exercise?.name) || "Exercise"}</Text>
                </LinearGradient>
                <BackButton light onPress={() => navigation.goBack()} />
            </View>

            <View style={styles.content}>
                {/* ACTION BUTTONS */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => setTimerModalVisible(true)}
                    >
                        <MaterialIcons name="timer" size={28} color={colors.text.white} />
                        <Text style={styles.iconButtonText}>
                            {formatSeconds(getRestTime(user, exercise))}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Exercise", { exerciseId })}>
                        <MaterialIcons name="menu-book" size={28} color={colors.text.white} />
                        <Text style={styles.iconButtonText}>Instructions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => {/* Analytics action */ }}>
                        <MaterialIcons name="bar-chart" size={28} color={colors.text.white} />
                        <Text style={styles.iconButtonText}>Analytics</Text>
                    </TouchableOpacity>
                </View>

                {/* WARM-UP SETS SECTION */}
                {warmupSets.length > 0 && (
                    <>
                        <View style={styles.warmupHeaderRow}>
                            <Text style={styles.sectionHeader}>Warm-up sets</Text>
                            <TouchableOpacity
                                style={styles.warmupToggle}
                                onPress={() => setCollapsedWarmup(v => !v)}
                                activeOpacity={0.7}
                            >
                                <MaterialIcons
                                    name={collapsedWarmup ? "expand-more" : "expand-less"}
                                    size={22}
                                    color={colors.text.primary}
                                />
                                <Text style={styles.warmupToggleText}>
                                    {collapsedWarmup ? "Show" : "Hide"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Animated.View
                            style={{
                                overflow: "hidden",
                                height: warmupAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, warmupSets.length * 54 + 12],
                                }),
                                opacity: warmupAnim,
                            }}
                        >
                            {renderHeaders()}
                            {warmupSets.map((set, idx) => renderSetRow(set, idx, true))}
                        </Animated.View>
                    </>
                )}

                {/* EFFECTIVE SETS */}
                <Text style={styles.sectionHeader}>Effective sets</Text>
                {renderHeaders()}
                {effectiveSets.map((set, idx) => renderSetRow(set, idx, false))}

                {/* ADD SET BUTTON */}
                <View style={styles.addSetRow}>
                    <TouchableOpacity
                        style={styles.addSetIconWrapper}
                        onPress={() => setAddMenuVisible(true)}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="add" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setAddMenuVisible(true)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.addSetText}>Add set</Text>
                    </TouchableOpacity>
                    {addMenuVisible && (
                        <View style={styles.addSetMenu}>
                            <TouchableOpacity
                                style={styles.addSetMenuItem}
                                onPress={() => { setAddMenuVisible(false); handleAddSet(false); }}
                            >
                                <Text style={styles.addSetMenuText}>Add Effective Set</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.addSetMenuItem}
                                onPress={() => { setAddMenuVisible(false); handleAddSet(true); }}
                            >
                                <Text style={styles.addSetMenuText}>Add Warm-up Set</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* NOTES */}
                <Text style={{ fontWeight: "bold", marginTop: 24, marginBottom: 6, fontSize: 16, color: colors.text.white }}>Notes</Text>
                <TextInput
                    style={styles.noteInput}
                    placeholder="Add notes about this exercise..."
                    placeholderTextColor={colors.text.muted}
                    value={note}
                    onChangeText={setNote}
                    multiline
                />

                {/* LAST LOG */}
                {lastLog && (
                    <Text style={styles.lastLog}>
                        Last logged: {new Date(lastLog.TrainingExercises.timestamp).toLocaleString()}
                    </Text>
                )}

                <CustomTimerModal
                    visible={timerModalVisible}
                    exercise={exercise}
                    onClose={() => setTimerModalVisible(false)}
                />
            </View>
        </KeyboardAwareScrollView>

        {/* Inline floating timer */}
        <View style={styles.content}>
            {inlineTimerVisible && (
                <MiniTimer
                    initialSeconds={inlineTimerValue}
                    onClose={() => setInlineTimerVisible(false)}
                    resetSignal={timerResetSignal}
                />
            )}
        </View>
    </View>
);
}
