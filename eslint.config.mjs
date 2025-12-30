import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig } from "eslint/config";

/**
 * ESLint Flat Config para Next.js 16.1.1
 * Usa el formato nativo flat config de eslint-config-next 16.x
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      ".vercel/**",
      "*.config.js",
      "*.config.ts",
      "*.config.mjs",
      "out/**",
      "next-env.d.ts",
    ],
  },
]);

export default eslintConfig;
