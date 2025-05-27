import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProfileScreen from "../features/profile/screens/ProfileScreen";
import AuthStack from "../navigation/AuthStack"

const Stack = createStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Auth" component={AuthStack} />
    </Stack.Navigator>
  );
}
