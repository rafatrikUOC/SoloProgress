import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import Toast from 'react-native-toast-message';

import { ThemeProvider } from "./global/contexts/ThemeContext";
import BottomTabs from "./navigation/BottomTabs";
import OnboardingStack from "./navigation/OnboardingStack";
import checkFirstLaunch from "./global/utils/isFirstLaunch";
import LaunchScreen from "./features/auth/screens/LaunchScreen";

const App = () => {
  const [showLaunch, setShowLaunch] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    if (!showLaunch) {
      checkFirstLaunch().then(setIsFirstLaunch);
    }
  }, [showLaunch]);

  if (showLaunch) {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" />
          <LaunchScreen onFinish={() => setShowLaunch(false)} />
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  if (isFirstLaunch === null) {
    return null;
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer>
          {isFirstLaunch ? <OnboardingStack /> : <BottomTabs />}
          <Toast />
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
};

export default App;
