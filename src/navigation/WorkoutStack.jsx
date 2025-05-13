import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

// Features screens
import HomeScreen from "../features/workout/screens/HomeScreen";
import FitnessPlanScreen from "../features/workout/screens/FitnessPlanScreen";
import NextWorkoutScreen from "../features/workout/screens/NextWorkoutScreen";
import MyRoutinesScreen from "../features/workout/screens/MyRoutinesScreen";
import RoutineInfoScreen from "../features/workout/screens/RoutineInfoScreen";

// Other features screens
import ExerciseScreen from "../features/exercises/screens/ExerciseScreen";

const Stack = createStackNavigator();

export default function WorkoutStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Feature screens */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="FitnessPlan" component={FitnessPlanScreen} />
      <Stack.Screen name="NextWorkout" component={NextWorkoutScreen} />
      <Stack.Screen name="MyRoutines" component={MyRoutinesScreen} />
      <Stack.Screen name="RoutineInfo" component={RoutineInfoScreen} />

      {/* Other features screens */}
      <Stack.Screen name="Exercise" component={ExerciseScreen} />
    </Stack.Navigator>
  );
}
