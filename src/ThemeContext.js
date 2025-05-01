// src/ThemeContext.js
import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
	const [theme, setTheme] = useState('dark');
	
	const values = {
		theme,
		setTheme,
		isDarkMode: theme === 'dark',
		isHighContrast: theme === 'contrast'
	};
	
	return (
		<ThemeContext.Provider value={values}>
		{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => useContext(ThemeContext);
