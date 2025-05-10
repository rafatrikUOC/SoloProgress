import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../features/auth/screens/LoginScreen";
import ForgotPassword from "../features/auth/screens/ForgotPasswordScreen";
import Register1 from "../features/auth/screens/Register1Screen";
import Register2 from "../features/auth/screens/Register2Screen";
import Register3 from "../features/auth/screens/Register3Screen";
import Register4 from "../features/auth/screens/Register4Screen";
import Register5 from "../features/auth/screens/Register5Screen";
import Register6 from "../features/auth/screens/Register6Screen";
import Register7 from "../features/auth/screens/Register7Screen";
import Register8 from "../features/auth/screens/Register8Screen";
import Register9 from "../features/auth/screens/Register9Screen";
import Register10 from "../features/auth/screens/Register10Screen";


const Stack = createStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Login screen */}
      <Stack.Screen name="Login" component={Login} />

      {/* Registration screens */}
      <Stack.Screen name="Register1" component={Register1} />
      <Stack.Screen name="Register2" component={Register2} />
      <Stack.Screen name="Register3" component={Register3} />
      <Stack.Screen name="Register4" component={Register4} />
      <Stack.Screen name="Register5" component={Register5} />
      <Stack.Screen name="Register6" component={Register6} />
      <Stack.Screen name="Register7" component={Register7} />
      <Stack.Screen name="Register8" component={Register8} />
      <Stack.Screen name="Register9" component={Register9} />
      <Stack.Screen name="Register10" component={Register10} />

      {/* Forgot Password screen */}
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    </Stack.Navigator>
  );
}
