import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "dist/**",
    "node_modules/**",
    "public/pdf.worker.min.mjs",
    "SafeWallet-ghsa-g374-rpgq-fphx/**",
    "v3/**",
    "v3/gateway-nest/dist/**",
    "v3/gateway-nest/coverage/**",
    "v3/security-rust/target/**",
    "src/app/prototype/**",
    "test_api*.mjs",
    "test_csv.mjs",
    "test_pdf.mjs",
  ]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "off",
    },
  },
]);

export default eslintConfig;
