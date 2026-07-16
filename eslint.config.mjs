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
    // Reference projects
    "BNI/**",
    "Gerador de orçamentos/**",
    "IN/**",
    "Laudos_de_Alarme_de_Incendio/**",
    "Laudos_de_eventos_SCFire/**",
    "Propostas comerciais/**",
    "Treinamentos_SCFire/**",
  ]),
]);

export default eslintConfig;
