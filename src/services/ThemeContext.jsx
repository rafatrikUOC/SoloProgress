import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorSchemes } from "../styles/colorSchemes";
import { typography } from "../styles/typography";

// Theme configuration
const themeConfig = {
  dark: { colors: colorSchemes.dark, typography },
  light: { colors: colorSchemes.light, typography },
  contrast: { colors: colorSchemes.contrast, typography }
};

// Create the context
const ThemeContext = createContext();

// Context provider component
export const ThemeProvider = ({ children }) => {
  // State for current theme
  const [currentTheme, setCurrentTheme] = useState("dark");

  // Load theme from AsyncStorage when component mounts
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("user_theme");
        if (savedTheme && themeConfig[savedTheme]) {
          setCurrentTheme(savedTheme);
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    };
    loadTheme();
  }, []);

  // Function to change the theme
  const setTheme = async (themeName) => {
    if (!themeConfig[themeName]) return;
    try {
      await AsyncStorage.setItem("user_theme", themeName);
      setCurrentTheme(themeName);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  // Theme values for the context
  const themeValues = {
    theme: currentTheme,
    colors: themeConfig[currentTheme].colors,
    typography: themeConfig[currentTheme].typography,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={themeValues}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use the theme context
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
};

// For backward compatibility with existing code using useTheme
export const useTheme = useThemeContext;