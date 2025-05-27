import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { UserContext } from "../global/contexts/UserContext";

import AuthStack from "./AuthStack";
import BottomTabs from "./BottomTabs";
import OnboardingStack from "./OnboardingStack";

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
