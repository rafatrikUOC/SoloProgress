import React, { useState, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { ThemeProvider } from "./global/contexts/ThemeContext";
import { UserProvider } from "./global/contexts/UserContext";
import LaunchScreen from "./features/auth/screens/LaunchScreen";
import checkFirstLaunch from "./global/utils/isFirstLaunch";
import RootNavigator from "./navigation/RootNavigator";

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

  if (isFirstLaunch === null) return null;

  return (
    <ThemeProvider>
      <UserProvider>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" />
          <RootNavigator isFirstLaunch={isFirstLaunch} />
        </SafeAreaProvider>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
