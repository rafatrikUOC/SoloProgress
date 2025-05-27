import React, { useContext, useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { UserContext } from "../global/contexts/UserContext";
import { getData } from "../global/utils/storage";

import AuthStack from "./AuthStack";
import BottomTabs from "./BottomTabs";
import OnboardingStack from "./OnboardingStack";

export default function RootNavigator({ isFirstLaunch }) {
  const { user } = useContext(UserContext);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const checkFlag = async () => {
        const flag = await getData("mustChangePassword");
        setMustChangePassword(!!flag);
        setLoading(false);
      };
      checkFlag();
    }, [user]);
  
    if (loading) return null;

    let content;
    if (isFirstLaunch) {
      content = <OnboardingStack />;
    } else if (mustChangePassword) {
      content = <AuthStack initialRouteName="ChangePassword" />;
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
