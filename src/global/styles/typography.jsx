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
	// Different sizes with primary
	primaryXl:   { fontSize: textSizes.xl, fontFamily: textFont.primaryFont },
	primaryLg:   { fontSize: textSizes.lg, fontFamily: textFont.primaryFont },
	primaryMd:   { fontSize: textSizes.md, fontFamily: textFont.primaryFont },
	primaryBase: { fontSize: textSizes.base, fontFamily: textFont.primaryFont },
	primarySm:   { fontSize: textSizes.sm, fontFamily: textFont.primaryFont },

	// Different sizes with secondary
	secondaryXl:    { fontSize: textSizes.xl,   fontFamily: textFont.secondaryFont },
	secondaryLg:    { fontSize: textSizes.lg,   fontFamily: textFont.secondaryFont },
	secondaryMd:    { fontSize: textSizes.md,   fontFamily: textFont.secondaryFont },
	secondaryBase:  { fontSize: textSizes.base, fontFamily: textFont.secondaryFont },
	secondarySm:    { fontSize: textSizes.sm,   fontFamily: textFont.secondaryFont },

	// Launch screen
	launchTitle:    { fontSize: textSizes.xxxl, fontFamily: textFont.primaryFont },
	launchSubtitle: { fontSize: textSizes.lg, fontFamily: textFont.primaryFont },

	// Screen titles
	screenTitle:    { fontSize: textSizes.xl, fontFamily: textFont.primaryFont },
	sectionHeading: {fontSize: textSizes.lg, fontFamily: textFont.secondaryFont },

	// Card titles and body text
	cardTitle:  { fontSize: textSizes.md, fontFamily: textFont.secondaryFont },
	bodyLarge:  { fontSize: textSizes.md, fontFamily: textFont.secondaryFont },
	bodyMedium: { fontSize: textSizes.base, fontFamily: textFont.secondaryFont },
	bodySmall:  { fontSize: textSizes.sm, fontFamily: textFont.primaryFont },
	
	// Button text
	buttonLarge:  { fontSize: textSizes.lg, fontFamily: textFont.primaryFont },
	buttonMedium: { fontSize: textSizes.md, fontFamily: textFont.secondaryFont },
	buttonSmall:  { fontSize: textSizes.base, fontFamily: textFont.secondaryFont },

	// Input fields
	input: { fontSize: textSizes.base, fontFamily: textFont.secondaryFont },
	label: { fontSize: textSizes.md, fontFamily: textFont.primaryFont },

	// Numeric values
	numericXXL:  { fontSize: textSizes.xxxl, fontFamily: textFont.secondaryFont },
	numericXL:   { fontSize: textSizes.xxl, fontFamily: textFont.secondaryFont },
	numericLG:   { fontSize: textSizes.xl, fontFamily: textFont.secondaryFont },
	numericMD:   { fontSize: textSizes.lg, fontFamily: textFont.secondaryFont },
	numericBase: { fontSize: textSizes.md, fontFamily: textFont.secondaryFont },
	numericSM:   { fontSize: textSizes.base, fontFamily: textFont.secondaryFont },
};
