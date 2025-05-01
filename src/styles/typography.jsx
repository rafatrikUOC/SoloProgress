//Typography settings
// Font families
const textFont = {
	primaryFont: "Poppins, sans-serif",
	secondaryFont: "League Spartan, sans-serif",
};

// Base text sizes as variables
const textSizes = {
	xxxl: 64,
	xxl: 40,
	xl: 32,
	lg: 24,
	md: 20,
	base: 16,
	sm: 14,
};

// Typography settings
export const typography = {
	launchTitle: { fontSize: textSizes.xxl, fontFamily: textFont.primaryFont },
	launchSubtitle: { fontSize: textSizes.xl, fontFamily: textFont.primaryFont },
	screenTitle: { fontSize: textSizes.md, fontFamily: textFont.secondaryFont },
	sectionHeading: {fontSize: textSizes.lg, fontFamily: textFont.secondaryFont },
	cardTitle: { fontSize: textSizes.md, fontFamily: textFont.secondaryFont },
	bodyLarge: { fontSize: textSizes.md, fontFamily: textFont.secondaryFont },
	bodyMedium: { fontSize: textSizes.base, fontFamily: textFont.secondaryFont },
	bodySmall: { fontSize: textSizes.sm, fontFamily: textFont.primaryFont },
	buttonLarge: { fontSize: textSizes.lg, fontFamily: textFont.primaryFont },
	buttonMedium: { fontSize: textSizes.md, fontFamily: textFont.secondaryFont },
	buttonSmall: { fontSize: textSizes.base, fontFamily: textFont.secondaryFont },
	input: { fontSize: textSizes.base, fontFamily: textFont.secondaryFont },
	label: { fontSize: textSizes.lg, fontFamily: textFont.primaryFont },
	numericXXL: { fontSize: textSizes.xxxl, fontFamily: textFont.secondaryFont },
	numericXL: { fontSize: textSizes.xxl, fontFamily: textFont.secondaryFont },
	numericLG: { fontSize: textSizes.xl, fontFamily: textFont.secondaryFont },
};
