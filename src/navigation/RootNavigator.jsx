import React, { useContext, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import AuthStack from "./AuthStack";
import BottomTabs from "./BottomTabs";
import OnboardingStack from "./OnboardingStack";
import { UserContext } from "../global/contexts/UserContext";

export default function RootNavigator({ isFirstLaunch }) {
  const { user } = useContext(UserContext);

  let content;
  if (isFirstLaunch) {
    content = <OnboardingStack />;
  } else if (!user.info) {
    content = <AuthStack />;
  } else {
    content = <BottomTabs />;
  }

  return (
    <NavigationContainer>
      {content}
      <Toast />
    </NavigationContainer>
  );
}
