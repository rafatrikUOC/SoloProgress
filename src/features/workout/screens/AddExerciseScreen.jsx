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

export default function AddExerciseScreen({ navigation, route }) {
    const { colors } = useThemeContext();
    const { user } = useContext(UserContext);

    const {
        trainingSessionId,
        workoutId,
        workoutExercises = []
    } = route.params || {};

    const userId = user?.info?.id;

    // Exclude ALL current exercises and user-excluded ones
    const idsToExclude = useMemo(() => {
        const excluded = user?.settings?.performance_data?.excluded_exercises || [];
        return [
            ...workoutExercises.map(e => typeof e === "object" ? e.id : e),
            ...excluded
        ];
    }, [workoutExercises, user]);

    const { addExerciseFull } = useExerciseActions({ userId, user });

    const [allExercises, setAllExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [adding, setAdding] = useState(false);

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
    }, [idsToExclude]);

    // Simple search and prioritization by name or muscle
    const filtered = useMemo(() => {
        if (!allExercises.length) return [];
        let list = allExercises;

        if (search.trim().length === 0) {
            return list.slice(0, 20);
        } else {
            const q = search.trim().toLowerCase();
            list = list.filter(ex =>
                ex.name.toLowerCase().includes(q) ||
                (ex.primary_muscle && ex.primary_muscle.toLowerCase().includes(q)) ||
                (Array.isArray(ex.secondary_muscles) && ex.secondary_muscles.some(m => m.toLowerCase().includes(q)))
            );
            return list.slice(0, 20);
        }
    }, [search, allExercises]);

    const handleAdd = async (exercise) => {
        setAdding(true);
        try {
            await addExerciseFull({
                plannedWorkoutId: workoutId,
                trainingSessionId,
                newExerciseId: exercise.id,
                position: null
            });
        } catch (e) {
            Alert.alert("Error", "Could not add exercise.");
            setAdding(false);
        }
        setAdding(false);
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
        addingContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        addingText: {
            color: colors.text.primary,
            fontSize: 18,
            marginTop: 18,
            fontWeight: "bold",
        },
    });

    return (
        <View style={styles.container}>
            {!adding && <BackButton onPress={handleBack} />}
            <View style={styles.resultsContainer}>
                <ScreenTitle title="Add Exercise" />
                {adding ? (
                    <View style={styles.addingContainer}>
                        <ActivityIndicator size="large" color={colors.text.primary} />
                        <Text style={styles.addingText}>Adding exercise...</Text>
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
                                    onPress={() => handleAdd(item)}
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
