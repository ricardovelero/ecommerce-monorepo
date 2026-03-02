import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginImport from "eslint-plugin-import";

export default [
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/*.d.ts", "apps/backend/generated/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      import: eslintPluginImport,
    },
    rules: {
      "no-undef": "off",
      "import/order": [
        "error",
        {
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "always",
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
