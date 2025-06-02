module.exports = {
  preset: "jest-expo",
  testEnvironment: "node",
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest"
  },
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|react-clone-referenced-element|@react-native|@react-native-community|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|sentry-expo|native-base|react-native-url-polyfill|@supabase|@supabase/.*)"
  ],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json"],
  setupFiles: [
    "./node_modules/react-native-gesture-handler/jestSetup.js"
  ],
  setupFilesAfterEnv: [
    "@testing-library/jest-native/extend-expect"
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts"
  ],
  coverageThreshold: {
    global: {
      lines: 75
    }
  },
  verbose: true
};
