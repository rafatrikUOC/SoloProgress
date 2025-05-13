import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

// Features screens
import RoutinesScreen from "../features/routines/screens/RoutinesScreen";

// Other features screens
import ExerciseScreen from "../features/exercises/screens/ExerciseScreen";

const Stack = createStackNavigator();

export default function RoutinesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoutinesMain" component={RoutinesScreen} />
      {/* Otras pantallas del stack */}

      {/* Other features screens */}
      <Stack.Screen name="Exercise" component={ExerciseScreen} />
    </Stack.Navigator>
  );
}
