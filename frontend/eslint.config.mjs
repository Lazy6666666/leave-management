/**
 * @file ESLint configuration file for the Next.js frontend.
 * @see https://eslint.org/docs/latest/use/configure/configuration-files-new
 */

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

/**
 * The absolute path to the current file.
 * @type {string}
 */
const __filename = fileURLToPath(import.meta.url);

/**
 * The absolute path to the directory containing the current file.
 * @type {string}
 */
const __dirname = dirname(__filename);

/**
 * A compatibility utility that allows the use of legacy ESLint configurations.
 * @type {FlatCompat}
 */
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * The main ESLint configuration object.
 * This configuration extends the recommended settings from Next.js and includes custom ignore patterns.
 * @type {import('eslint').Linter.FlatConfig[]}
 */
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
