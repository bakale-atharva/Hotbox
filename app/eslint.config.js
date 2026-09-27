// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // eslint-plugin-react 7.37's React version detection calls
    // `context.getFilename()`, which ESLint 10 removed. Pinning the version
    // skips detection. Keep in sync with the installed `react` major.minor.
    settings: { react: { version: "19.2" } },
  },
]);
