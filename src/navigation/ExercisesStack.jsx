import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

// Feature screens
import ExercisesScreen from "../features/exercises/screens/ExercisesScreen";
import ExerciseScreen from "../features/exercises/screens/ExerciseScreen";

const Stack = createStackNavigator();

export default function ExercisesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Feature screens */}
      <Stack.Screen name="ExercisesMain" component={ExercisesScreen} />
      <Stack.Screen name="Exercise" component={ExerciseScreen} />

      {/* Other features screens */}
    </Stack.Navigator>
  );
}
