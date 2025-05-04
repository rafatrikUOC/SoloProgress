import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/Auth/LoginScreen";
import ForgotPassword from "../screens/Auth/ForgotPasswordScreen";
import Register1 from "../screens/Auth/Register1Screen";
import Register2 from "../screens/Auth/Register2Screen";
import Register3 from "../screens/Auth/Register3Screen";
import Register4 from "../screens/Auth/Register4Screen";

const Stack = createStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register1" component={Register1} />
      <Stack.Screen name="Register2" component={Register2} />
      <Stack.Screen name="Register3" component={Register3} />
      <Stack.Screen name="Register4" component={Register4} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    </Stack.Navigator>
  );
}
