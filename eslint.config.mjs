import eslint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
    eslint.configs.recommended,
    tseslint.configs.recommended,
    globalIgnores(["**/*.js", "**/*.d.ts", "assets/plugins/**", "tools/**", "node_modules/**"]),
    {
        plugins: {
            "@stylistic": stylistic,
        },
        files: ["src/**/*.ts"],
        rules: {
            eqeqeq: "error",
            curly: ["error", "all"],
            "no-unused-vars": "off",
            "no-shadow": "warn",
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-namespace": "off",
            // https://eslint.style/rules/js/lines-between-class-members
            "@stylistic/lines-between-class-members": [
                "error",
                {
                    enforce: [
                        { blankLine: "always", prev: "method", next: "method" },
                        { blankLine: "always", prev: "field", next: "method" },
                        { blankLine: "always", prev: "method", next: "field" },
                    ],
                },
            ],
        },
    },
]);
