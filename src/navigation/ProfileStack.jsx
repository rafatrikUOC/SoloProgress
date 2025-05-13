import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProfileScreen from "../features/profile/screens/ProfileScreen";
import AuthStack from "../navigation/AuthStack"
// Importa aquí otras pantallas del stack si las hay

const Stack = createStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Auth" component={ProfileScreen} />
      {/* Otras pantallas del stack */}
    </Stack.Navigator>
  );
}
