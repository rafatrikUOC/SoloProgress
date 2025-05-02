//Typography settings
// Font families
const textFont = {
	primaryFont: "Poppins, sans-serif",
	secondaryFont: "League Spartan, sans-serif",
};

// Base text sizes as variables
const textSizes = {
	xxxl: 48,
	xxl: 40,
	xl: 32,
	lg: 24,
	md: 20,
	base: 16,
	sm: 14,
};

// Typography settings
export const typography = {
	// Launch screen
	launchTitle: { fontSize: textSizes.xxxl, fontFamily: textFont.primaryFont },
	launchSubtitle: { fontSize: textSizes.lg, fontFamily: textFont.primaryFont },

	// Screen titles
	screenTitle: { fontSize: textSizes.md, fontFamily: textFont.secondaryFont },
	sectionHeading: {fontSize: textSizes.lg, fontFamily: textFont.secondaryFont },

	// Card titles and body text
	cardTitle: { fontSize: textSizes.md, fontFamily: textFont.secondaryFont },
	bodyLarge: { fontSize: textSizes.md, fontFamily: textFont.secondaryFont },
	bodyMedium: { fontSize: textSizes.base, fontFamily: textFont.secondaryFont },
	bodySmall: { fontSize: textSizes.sm, fontFamily: textFont.primaryFont },
	
	// Button text
	buttonLarge: { fontSize: textSizes.lg, fontFamily: textFont.primaryFont },
	buttonMedium: { fontSize: textSizes.md, fontFamily: textFont.secondaryFont },
	buttonSmall: { fontSize: textSizes.base, fontFamily: textFont.secondaryFont },

	// Input fields
	input: { fontSize: textSizes.base, fontFamily: textFont.secondaryFont },
	label: { fontSize: textSizes.lg, fontFamily: textFont.primaryFont },

	// Numeric values
	numericXXL: { fontSize: textSizes.xxxl, fontFamily: textFont.secondaryFont },
	numericXL: { fontSize: textSizes.xxl, fontFamily: textFont.secondaryFont },
	numericLG: { fontSize: textSizes.xl, fontFamily: textFont.secondaryFont },
	numericMD: { fontSize: textSizes.lg, fontFamily: textFont.secondaryFont },
	numericBase: { fontSize: textSizes.md, fontFamily: textFont.secondaryFont },
	numericSM: { fontSize: textSizes.base, fontFamily: textFont.secondaryFont },
};
