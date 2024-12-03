module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|react-navigation|@react-navigation/.*|expo|@expo/.*|@unimodules/.*|unimodules-permissions-interface|sentry-expo|@react-native/js-polyfills)",
  ],
};
