import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  { ignores: ["**/*.json", ".env", ".gitignore", "**/*.yml"] },
  {
    files: ["migrations/**/*.js"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "commonjs",
      },
      globals: {
        ...globals.node,
      },
    },
    ...pluginJs.configs.recommended,
  },
  {
    files: ["**/*.js", "!migrations/**/*.js"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "commonjs",
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    ...pluginJs.configs.recommended,
  },
];
