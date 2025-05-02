import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "./services/ThemeContext";
import BottomTabs from "./navigation/BottomTabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import LaunchScreen from "./screens/LaunchScreen";
import OnboardingStack from "./navigation/OnboardingStack";
import checkFirstLaunch from "./utils/isFirstLaunch";

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
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
};

export default App;
