import React, { useState, useEffect, useContext, useMemo } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    Alert,
} from "react-native";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { UserContext } from "../../../global/contexts/UserContext";
import { fetchExercises } from "../../exercises/services/exerciseService";
import { useExerciseActions } from "../hooks/useExerciseActions";
import { ExerciseCard } from "../../exercises/components/ExerciseCard";
import { ScreenTitle, BackButton } from "../../../global/components/UIElements";

export default function ReplaceExerciseScreen({ navigation, route }) {
    const { colors } = useThemeContext();
    const { user } = useContext(UserContext);

    const {
        exerciseId,
        trainingSessionId,
        workoutId,
        dontRecommend = false,
        primaryMuscle,
        secondaryMuscles = [],
        workoutExercises = [],
    } = route.params || {};

    const userId = user?.info?.id;

    // Exclude ALL current exercises (including the one being replaced)
    const idsToExclude = useMemo(() => {
        const excluded = user?.settings?.performance_data?.excluded_exercises || [];
        return [
            ...workoutExercises.map(e => typeof e === "object" ? e.id : e),
            ...excluded
        ];
    }, [workoutExercises, user]);

    const {
        excludeExercise,
        replaceExerciseFull,
    } = useExerciseActions({ userId, user });

    const [allExercises, setAllExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [replacing, setReplacing] = useState(false);

    useEffect(() => {
        async function loadExercises() {
            setLoading(true);
            try {
                const data = await fetchExercises(idsToExclude);
                setAllExercises(data || []);
            } catch (e) {
                Alert.alert("Error", "Could not load exercises.");
            }
            setLoading(false);
        }
        loadExercises();
    }, []);

    const prioritizeExercises = (exercises) => {
        if (!primaryMuscle) return exercises;
        const main = [];
        const secondary = [];
        const rest = [];
        exercises.forEach(ex => {
            if (
                ex.primary_muscle &&
                ex.primary_muscle.toLowerCase() === primaryMuscle.toLowerCase()
            ) {
                main.push(ex);
            } else if (
                Array.isArray(ex.secondary_muscles) &&
                ex.secondary_muscles.some(m =>
                    Array.isArray(secondaryMuscles) &&
                    secondaryMuscles.some(sec =>
                        m.toLowerCase() === sec.toLowerCase()
                    )
                )
            ) {
                secondary.push(ex);
            } else {
                rest.push(ex);
            }
        });
        return [...main, ...secondary, ...rest];
    };

    // Filter/prioritize list, excluding ALL exercises already in the workout
    const filtered = useMemo(() => {
        if (!allExercises.length) return [];
        let list = allExercises.filter(ex => !idsToExclude.includes(ex.id));

        if (search.trim().length === 0) {
            const prioritized = prioritizeExercises(list);
            return prioritized.slice(0, 20);
        } else {
            const q = search.trim().toLowerCase();
            list = list.filter(ex =>
                ex.name.toLowerCase().includes(q) ||
                (ex.primary_muscle && ex.primary_muscle.toLowerCase().includes(q)) ||
                (Array.isArray(ex.secondary_muscles) && ex.secondary_muscles.some(m => m.toLowerCase().includes(q)))
            );
            const prioritized = prioritizeExercises(list);
            return prioritized.slice(0, 20);
        }
    }, [search, allExercises, idsToExclude, primaryMuscle]);

    const handleReplace = async (newExercise) => {
        setReplacing(true);
        try {
            // Exclude the old exercise if dontRecommend is true
            if (dontRecommend) {
                await excludeExercise(exerciseId);
            }
            await replaceExerciseFull({
                plannedWorkoutId: workoutId,
                trainingSessionId,
                oldExerciseId: exerciseId,
                newExerciseId: newExercise.id,
            });
        } catch (e) {
            console.error("[ReplaceExerciseScreen] Error replacing exercise:", e);
            setReplacing(false);
        }
        setReplacing(false);
        navigation.goBack();
    };

    const handleBack = () => navigation.goBack();

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.body, padding: 0 },
        resultsContainer: { flex: 1, backgroundColor: colors.body, marginTop: 0 },
        searchInput: {
            backgroundColor: colors.card,
            color: colors.text.primary,
            borderRadius: 8,
            padding: 10,
            margin: 18,
            fontSize: 16,
        },
        noResultsText: {
            color: colors.text.muted,
            marginTop: 20,
            textAlign: "center",
            fontStyle: "italic",
            fontSize: 16,
        },
        replacingContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        replacingText: {
            color: colors.text.primary,
            fontSize: 18,
            marginTop: 18,
        },
        actionButtonWrapper: {
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 8,
            zIndex: 10,
        },
    });

    return (
        <View style={styles.container}>
            {!replacing && <BackButton onPress={handleBack} />}
            <View style={styles.resultsContainer}>
                <ScreenTitle title="Replace Exercise" />
                {replacing ? (
                    // Show loading overlay during replacement
                    <View style={styles.replacingContainer}>
                        <ActivityIndicator size="large" color={colors.text.primary} />
                        <Text style={styles.replacingText}>Replacing exercise...</Text>
                    </View>
                ) : (
                    <>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name or muscle..."
                            placeholderTextColor={colors.text.muted}
                            value={search}
                            onChangeText={setSearch}
                            autoCorrect={false}
                            autoCapitalize="none"
                        />
                        <FlatList
                            data={filtered}
                            keyExtractor={item => String(item.id)}
                            renderItem={({ item }) => (
                                <ExerciseCard
                                    exercise={item}
                                    onPress={() => handleReplace(item)}
                                />
                            )}
                            contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 80 }}
                            ListEmptyComponent={
                                loading ? (
                                    <ActivityIndicator size="large" color={colors.text.primary} />
                                ) : (
                                    <Text style={styles.noResultsText}>No exercises found.</Text>
                                )
                            }
                        />
                    </>
                )}
            </View>
        </View>
    );
}
