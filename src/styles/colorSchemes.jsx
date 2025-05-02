// Colors for the different themes
export const colorSchemes = {
	// Dark theme for night mode
	// This is the default theme for the app
	dark: {
		body: "#191A1A",
		card: "#202222",
		bg: {
			primary: "#20B8CD",
			secondary: "#2D2F2F",
		},
		text: {
			primary: "#20B8CD",
			primaryHover: "#1F98A6",
			primaryActive: "#1A7F8A",
			secondary: "#2D2F2F",
			secondaryHover: "#3A3C3C",
			secondaryActive: "#454747",
			muted: "#A0A0A0",
			white: "#FFFFFF",
			black: "#000000",
			light: "#CCCCCC",
			dark: "#191A1A",
			success: "#00BFA5",
			warning: "#FFEB3B",
			danger: "#FF5252",
			info: "#2196F3",
		},
		semantics: {
			workout: "#896CFE",
			volume: "#01BFAF",
			calories: "#FF6A9C",
			sets: "#E69BEB",
			distance: "#F44C4E",
		},
		calendar: {
			effort1: "#77BFCE",
			effort2: "#2C9CB3",
			effort3: "#166E7F",
		},
		border: "#E8E8E6",
		shadow: "#000000",
	},

	// Light theme for day mode
	light: {
		body: "#F5F5F5",
		card: "#FFFFFF",
		bg: {
			primary: "#1A73E8",
			secondary: "#E8E8E6",
		},
		text: {
			primary: "#1A73E8",
			primaryHover: "#1557B0",
			primaryActive: "#104A8D",
			secondary: "#E8E8E6",
			secondaryHover: "#DEDEDE",
			secondaryActive: "#D3D3D3",
			muted: "#5A5A5A",
			white: "#2D2D2D",
			black: "#FFFFFF",
			success: "#00BFA5",
			warning: "#FFEB3B",
			danger: "#FF5252",
			info: "#2196F3",
		},
		semantics: {
			workout: "#5E35B1",
			volume: "#00BFA5",
			calories: "#FF5252",
			sets: "#AB47BC",
			distance: "#EF5350",
		},
		calendar: {
			effort1: "#80DEEA",
			effort2: "#00ACC1",
			effort3: "#00838F",
		},
		border: "#2D2D2D",
		shadow: "#A0A0A0",
	},

	// High contrast theme for accessibility
	contrast: {
		body: "#000000",
		card: "#121212",
		bg: {
			primary: "#FFEB3B",
			secondary: "#424242",
		},
		text: {
			primary: "#FFEB3B",
			primaryHover: "#FFF176",
			primaryActive: "#FFEE58",
			secondary: "#424242",
			secondaryHover: "#5C5C5C",
			secondaryActive: "#737373",
			muted: "#CCCCCC",
			white: "#FFFFFF",
			black: "#000000",
			success: "#00E676",
			warning: "#FFEB3B",
			danger: "#FF6E40",
			info: "#2196F3",
		},
		semantics: {
			workout: "#FF80AB",
			volume: "#00E676",
			calories: "#FF6E40",
			sets: "#EA80FC",
			distance: "#FF4081",
		},
		calendar: {
			effort1: "#00B0FF",
			effort2: "#2962FF",
			effort3: "#651FFF",
		},
		border: "#FFFFFF",
		shadow: "#000000",
	},
};