import React from "react";
import { View, Text, FlatList, Button } from "react-native";
import { ExerciseCard } from "../../exercises/components/ExerciseCard";


// ...
export default function PlannedWorkoutsList({ plannedWorkouts, onRecalculate }) {
  return (
    <FlatList
      data={plannedWorkouts}
      keyExtractor={item => item.session_index.toString()}
      renderItem={({ item }) => (
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>{item.title}</Text>
          <FlatList
            data={item.exercises}
            keyExtractor={exId => exId.toString()}
            renderItem={({ item: exId }) => (
              <ExerciseCard exerciseId={exId} /> {/* O busca el ejercicio completo por ID */}
            )}
          />
          <Button title="Recalculate" onPress={() => onRecalculate(item.session_index)} />
        </View>
      )}
    />
  );
}
