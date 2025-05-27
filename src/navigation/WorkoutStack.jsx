import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

// Features screens
import HomeScreen from "../features/workout/screens/HomeScreen";
import FitnessPlanScreen from "../features/workout/screens/FitnessPlanScreen";
import NextWorkoutScreen from "../features/workout/screens/NextWorkoutScreen";
import MyRoutinesScreen from "../features/workout/screens/MyRoutinesScreen";
import RoutineInfoScreen from "../features/workout/screens/RoutineInfoScreen";
import FitnessGoalScreen from "../features/workout/screens/FitnessGoalScreen";
import WeeklyGoalScreen from "../features/workout/screens/WeeklyGoalScreen";
import FitnessExperienceScreen from "../features/workout/screens/FitnessExperienceScreen";
import WorkoutDurationScreen from "../features/workout/screens/WorkoutDurationScreen";
import AdvancedSettingsScreen from "../features/workout/screens/AdvancedSettingsScreen";
import NewGymScreen from "../features/workout/screens/NewGymScreen";
import RoutineLibraryScreen from "../features/workout/screens/RoutineLibraryScreen";

// Other features screens
import ExerciseScreen from "../features/exercises/screens/ExerciseScreen";

const Stack = createStackNavigator();

export default function WorkoutStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main feature screns */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="NextWorkout" component={NextWorkoutScreen} />
      <Stack.Screen name="NewGym" component={NewGymScreen} />

      {/* Plan configuration screens */}
      <Stack.Screen name="FitnessPlan" component={FitnessPlanScreen} />
      <Stack.Screen name="MyRoutines" component={MyRoutinesScreen} />
      <Stack.Screen name="RoutineInfo" component={RoutineInfoScreen} />
	    <Stack.Screen name="RoutineLibrary" component={RoutineLibraryScreen} />
      <Stack.Screen name="FitnessGoal" component={FitnessGoalScreen} />
      <Stack.Screen name="WeeklyGoal" component={WeeklyGoalScreen} />
      <Stack.Screen name="FitnessExperience" component={FitnessExperienceScreen} />
      <Stack.Screen name="WorkoutDuration" component={WorkoutDurationScreen} />
      <Stack.Screen name="AdvancedSettings" component={AdvancedSettingsScreen} />

      {/* Other stack features screens */}
      <Stack.Screen name="Exercise" component={ExerciseScreen} />
    </Stack.Navigator>
  );
}
