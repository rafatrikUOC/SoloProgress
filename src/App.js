import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "./services/ThemeContext";
import BottomTabs from "./navigation/BottomTabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "react-native";

const App = () => {
	return (
		<ThemeProvider>
			<SafeAreaProvider>
				<StatusBar barStyle="dark-content" />
				<NavigationContainer>
					<BottomTabs />
				</NavigationContainer>
			</SafeAreaProvider>
		</ThemeProvider>
	);
};

export default App;
