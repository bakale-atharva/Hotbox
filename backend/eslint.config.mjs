import { defineConfig, globalIgnores } from "eslint/config";
import convexPlugin from "@convex-dev/eslint-plugin";
import tseslint from "typescript-eslint";

export default defineConfig([
  ...tseslint.configs.recommended,
  ...convexPlugin.configs.recommended,
  {
    files: ["convex/auth.config.ts"],
    rules: {
      // Clerk's issuer domain is read when Convex pushes auth config.
      "@convex-dev/no-process-env": "off",
    },
  },
  globalIgnores(["convex/_generated"]),
]);
