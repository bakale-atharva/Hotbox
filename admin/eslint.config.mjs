import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // eslint-config-next sets `version: "detect"`, which makes
    // eslint-plugin-react 7.37 call `context.getFilename()`, removed in
    // ESLint 10. Pinning the version skips detection. Keep in sync with
    // the installed `react` major.minor.
    settings: { react: { version: "19.3" } },
  },
]);
