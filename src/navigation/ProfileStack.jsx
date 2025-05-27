import React, { useEffect, useState, useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProfileScreen from "../features/profile/screens/ProfileScreen";
import ChangePasswordScreen from "../features/profile/screens/ChangePasswordScreen";
import AuthStack from "../navigation/AuthStack";
import { getData } from "../global/utils/storage";
import { UserContext } from "../global/contexts/UserContext";

const Stack = createStackNavigator();

export default function ProfileStack() {
  // Access user context in case you want to re-check on login/logout
  const { user } = useContext(UserContext);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    // Check the mustChangePassword flag on mount and when user changes
    const checkFlag = async () => {
      const flag = await getData("mustChangePassword");
      setMustChangePassword(!!flag);
    };
    checkFlag();
  }, [user]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {mustChangePassword ? (
        // If the flag is set, only allow ChangePasswordScreen
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      ) : (
        // Otherwise, show the normal profile stack
        <>
          <Stack.Screen name="ProfileMain" component={ProfileScreen} />
          <Stack.Screen name="Auth" component={AuthStack} />
        </>
      )}
    </Stack.Navigator>
  );
}
