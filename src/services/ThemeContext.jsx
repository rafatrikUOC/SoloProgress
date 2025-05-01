import React, { createContext, useContext } from "react";
import { useTheme } from "./useTheme";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
	const theme = useTheme();
	return (
		<ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
	);
};

export const useThemeContext = () => useContext(ThemeContext);
