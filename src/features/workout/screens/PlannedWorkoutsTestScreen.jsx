import React, { useContext, useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator, ScrollView } from "react-native";
import { UserContext } from "../../../global/contexts/UserContext";
import { ExerciseCard } from "../../exercises/components/ExerciseCard";
import usePlannedWorkouts from "../hooks/usePlannedWorkouts";
import { fetchExercises } from "../../exercises/services/exerciseService";

export default function PlannedWorkoutsTestScreen() {
  const { user } = useContext(UserContext);

  // El split y gymId se extraen del usuario
  const split = user?.split;
  const gymId = user?.settings?.performance_data?.active_gym || null;

  // Estado para ejercicios
  const [allExercises, setAllExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(true);

  // Carga ejercicios solo una vez
  useEffect(() => {
    let isMounted = true;
    async function loadExercises() {
      setLoadingExercises(true);
      try {
        let excluded = user?.settings?.performance_data?.excluded_exercises || [];
        const data = await fetchExercises(excluded);
        if (isMounted) setAllExercises(data || []);
      } catch (error) {
        if (isMounted) setAllExercises([]);
        console.error("Error loading exercises:", error);
      } finally {
        if (isMounted) setLoadingExercises(false);
      }
    }
    loadExercises();
    return () => { isMounted = false; };
  }, []);

  // Hook: planned workouts (ya no necesitas pasar exercises ni gym)
  const {
    plannedWorkouts,
    loading,
    error,
    recalculateSession,
    regenerateAllWorkouts
  } = usePlannedWorkouts({ user, split, gymId });

  // Estado de carga global: si faltan ejercicios o workouts
  if (loading || loadingExercises) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!split || !gymId) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
        <Text style={{ fontSize: 18, textAlign: "center" }}>
          Please select a training split and an active gym in your profile/settings.
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
        <Text style={{ fontSize: 18, color: "red", textAlign: "center" }}>
          {error}
        </Text>
        <Button title="Try Again" onPress={regenerateAllWorkouts} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
        Planned Workouts ({split.title})
      </Text>
      <Button
        title="Regenerate All Workouts"
        onPress={regenerateAllWorkouts}
        color="#888"
      />

      {plannedWorkouts?.map((session, idx) => (
        <View
          key={idx}
          style={{
            marginBottom: 32,
            backgroundColor: "#222",
            borderRadius: 12,
            padding: 16
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ fontWeight: "bold", fontSize: 18, flex: 1 }}>
              {session.title}
            </Text>
            <Button
              title="Recalculate"
              onPress={() => recalculateSession(session.session_index)}
            />
          </View>

          {(!session.exercises || session.exercises.length === 0) ? (
            <Text style={{ color: "#aaa" }}>No exercises found for this session.</Text>
          ) : (
            session.exercises.map((exId) => {
              const exercise = allExercises.find(e => e.id === exId);
              return <ExerciseCard key={exId} exercise={exercise} />;
            })
          )}
        </View>
      ))}
    </ScrollView>
  );
}
