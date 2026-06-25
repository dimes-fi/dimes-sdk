import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import betterMaxParams from "eslint-plugin-better-max-params";
import checkFile from "eslint-plugin-check-file";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const project = "./tsconfig.json";

function legacyPlugin(name, alias = name) {
  const plugin = compat.plugins(name)[0]?.plugins?.[alias];
  if (!plugin) {
    throw new Error(`Unable to resolve plugin ${name} and/or alias ${alias}`);
  }
  return fixupPluginRules(plugin);
}

export default [
  {
    ignores: ["**/node_modules", "**/dist", "**/coverage", "eslint.config.mjs", "src/types/generated.ts"],
  },
  ...fixupConfigRules(
    compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended-type-checked",
      "plugin:@typescript-eslint/strict-type-checked",
      "plugin:@typescript-eslint/stylistic-type-checked",
      "plugin:import-x/recommended",
      "plugin:import-x/typescript",
      "prettier",
    ),
  ),
  {
    plugins: {
      "@typescript-eslint": legacyPlugin("@typescript-eslint", "@typescript-eslint"),
      "better-max-params": betterMaxParams,
      "check-file": checkFile,
      "import-x": legacyPlugin("eslint-plugin-import-x", "import-x"),
      "simple-import-sort": legacyPlugin("simple-import-sort", "simple-import-sort"),
    },

    languageOptions: {
      globals: {
        ...globals.node,
      },
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: "tsconfig.eslint.json",
        allowAutomaticSingleRunInference: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    settings: {
      "import-x/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project,
        },
      },
    },

    rules: {
      "better-max-params/better-max-params": ["error", { func: 5, constructor: 15 }],

      complexity: ["error", 10],
      "consistent-return": "error",
      curly: "error",
      "default-case": "error",
      "eol-last": ["error", "always"],
      eqeqeq: ["error", "smart"],

      "padding-line-between-statements": ["error", { blankLine: "always", prev: "export", next: "export" }],

      "lines-between-class-members": "error",
      "no-caller": "error",
      "no-duplicate-imports": "off",
      "import-x/no-duplicates": ["error", { "prefer-inline": true }],
      "no-else-return": "error",
      "no-sequences": "error",
      "no-unreachable-loop": "error",
      "no-console": "error",

      "max-lines": ["error", { max: 1000, skipBlankLines: true }],
      "max-len": [
        "error",
        {
          code: 120,
          ignoreUrls: true,
          ignorePattern: "^import .*|// *(TODO|@ai-fix|@ai-fixed|@ai-ask|@ai-answer|@ai-allow|@ai-pr):",
          ignoreTemplateLiterals: true,
        },
      ],
      "max-lines-per-function": ["error", { max: 100 }],
      "max-params": "off",

      "no-inner-declarations": "error",
      "no-magic-numbers": ["error", { ignore: [-1, 0, 1, "-1n", "0n", "1n"], ignoreArrayIndexes: true }],
      "no-multiple-empty-lines": ["error"],
      "no-multi-spaces": "error",
      "no-return-await": "error",
      "no-return-assign": "error",
      "no-param-reassign": "error",
      "no-proto": "error",
      "no-restricted-exports": "error",
      "no-restricted-globals": "error",
      "no-restricted-imports": "error",
      "no-restricted-properties": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "ForInStatement",
          message: "for...in loops iterate over prototype chain. Use Object.keys/entries with for...of instead.",
        },
        {
          selector: "ConditionalExpression > ConditionalExpression",
          message: "Nested ternaries are hard to read. Use if/else or extract to a function.",
        },
        {
          selector: "ExportDefaultDeclaration",
          message: "Prefer named exports for better refactoring support and consistency.",
        },
        {
          selector: "LabeledStatement",
          message: "Labeled statements indicate overly complex control flow. Refactor instead.",
        },
        {
          selector: "CallExpression[callee.property.name='bind'][arguments.0.type='ThisExpression']",
          message: "Use arrow functions instead of .bind(this).",
        },
        {
          selector: "TSEnumDeclaration",
          message: "Prefer const objects with 'as const' or union types over enums.",
        },
        {
          selector: "TSModuleDeclaration[kind='namespace']",
          message: "Namespaces are a legacy pattern. Use ES modules instead.",
        },
        {
          selector: "TSAsExpression > TSNeverKeyword",
          message: "Do not use 'as never' - it bypasses all type checking.",
        },
        {
          selector: "PropertyDefinition[definite=true]",
          message: "Use 'declare' modifier instead of definite assignment assertion (!).",
        },
        {
          selector: "TSTypeAliasDeclaration[id.name=/[Oo]ffer/]",
          message:
            "Use 'quote' terminology, not 'offer', in the public API. The priced+signed object is a Quote. Only deprecated back-compat aliases may use 'offer' (with an inline disable).",
        },
        {
          selector: "TSInterfaceDeclaration[id.name=/[Oo]ffer/]",
          message: "Use 'quote' terminology, not 'offer'. The priced+signed object is a Quote.",
        },
        {
          selector: ":matches(FunctionDeclaration, TSDeclareFunction)[id.name=/[Oo]ffer/]",
          message: "Use 'quote' terminology, not 'offer', in function names.",
        },
        {
          selector: "VariableDeclarator[id.name=/[Oo]ffer/]",
          message: "Use 'quote' terminology, not 'offer', in identifiers. The priced+signed object is a Quote.",
        },
        {
          selector: "TSPropertySignature[key.name=/[Oo]ffer/]",
          message: "Use 'quote' terminology, not 'offer', in public interface fields.",
        },
      ],
      "no-self-compare": "error",
      "no-use-before-define": "error",
      "no-useless-assignment": "error",
      "no-unused-expressions": "error",
      "object-shorthand": "error",
      "prefer-const": "error",
      "prefer-promise-reject-errors": ["error"],
      "require-atomic-updates": "error",

      "check-file/filename-naming-convention": [
        "error",
        { "**/*.ts": "KEBAB_CASE", "**/*.tsx": "KEBAB_CASE" },
        { ignoreMiddleExtensions: true },
      ],

      "import-x/namespace": "off",
      "import-x/first": "error",
      "import-x/newline-after-import": ["error", { count: 1 }],
      "import-x/no-absolute-path": "error",
      "import-x/no-cycle": "off",
      "import-x/no-deprecated": "warn",
      "import-x/no-empty-named-blocks": "error",
      "import-x/no-mutable-exports": "error",
      "import-x/no-named-as-default": "error",
      "import-x/no-named-as-default-member": "error",
      "import-x/no-namespace": "error",
      "import-x/no-self-import": "error",
      "import-x/order": ["warn", { alphabetize: { order: "asc" }, distinctGroup: true, "newlines-between": "never" }],

      "no-empty-function": "off",
      "no-shadow": "off",
      "no-unused-vars": "off",

      "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "as" }],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { disallowTypeAnnotations: true, fixStyle: "inline-type-imports", prefer: "type-imports" },
      ],
      "@typescript-eslint/explicit-function-return-type": ["error"],
      "@typescript-eslint/member-ordering": [
        "error",
        {
          default: {
            memberTypes: [
              "signature",
              "call-signature",
              "public-static-field",
              "protected-static-field",
              "private-static-field",
              "#private-static-field",
              "public-decorated-field",
              "protected-decorated-field",
              "private-decorated-field",
              "public-instance-field",
              "protected-instance-field",
              "private-instance-field",
              "#private-instance-field",
              "public-abstract-field",
              "protected-abstract-field",
              "public-field",
              "protected-field",
              "private-field",
              "#private-field",
              "static-field",
              "instance-field",
              "abstract-field",
              "decorated-field",
              "field",
              "static-initialization",
              "public-constructor",
              "protected-constructor",
              "private-constructor",
              "constructor",
              "public-static-get",
              "protected-static-get",
              "private-static-get",
              "#private-static-get",
              "public-decorated-get",
              "protected-decorated-get",
              "private-decorated-get",
              "public-instance-get",
              "protected-instance-get",
              "private-instance-get",
              "#private-instance-get",
              "public-abstract-get",
              "protected-abstract-get",
              "public-get",
              "protected-get",
              "private-get",
              "#private-get",
              "static-get",
              "instance-get",
              "abstract-get",
              "decorated-get",
              "get",
              "public-static-set",
              "protected-static-set",
              "private-static-set",
              "#private-static-set",
              "public-decorated-set",
              "protected-decorated-set",
              "private-decorated-set",
              "public-instance-set",
              "protected-instance-set",
              "private-instance-set",
              "#private-instance-set",
              "public-abstract-set",
              "protected-abstract-set",
              "public-set",
              "protected-set",
              "private-set",
              "#private-set",
              "static-set",
              "instance-set",
              "abstract-set",
              "decorated-set",
              "set",
              "public-static-method",
              "protected-static-method",
              "private-static-method",
              "#private-static-method",
              "public-decorated-method",
              "protected-decorated-method",
              "private-decorated-method",
              "public-instance-method",
              "protected-instance-method",
              "private-instance-method",
              "#private-instance-method",
              "public-abstract-method",
              "protected-abstract-method",
              "public-method",
              "protected-method",
              "private-method",
              "#private-method",
              "static-method",
              "instance-method",
              "abstract-method",
              "decorated-method",
              "method",
            ],
          },
        },
      ],
      "@typescript-eslint/explicit-member-accessibility": ["error", { overrides: { constructors: "no-public" } }],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["strictCamelCase"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: "variable",
          modifiers: ["const", "exported"],
          format: ["strictCamelCase", "StrictPascalCase"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: "variable",
          format: ["strictCamelCase"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        { selector: "typeLike", format: ["StrictPascalCase"] },
        { selector: "import", format: null },
        {
          selector: "property",
          format: null,
        },
        { selector: "objectLiteralMethod", format: null },
        {
          selector: "variable",
          modifiers: ["const"],
          format: ["strictCamelCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
      ],
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
      "@typescript-eslint/no-empty-function": ["error", { allow: ["constructors"] }],
      "@typescript-eslint/no-extraneous-class": ["error", { allowWithDecorator: true }],
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/no-shadow": ["error"],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/prefer-for-of": "error",
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "@typescript-eslint/only-throw-error": "off",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts"],
    rules: {
      "max-lines": ["error", { max: 1000, skipBlankLines: true }],
      "max-lines-per-function": ["error", { max: 1000 }],
      "no-magic-numbers": "off",
      "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "as" }],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
      "@typescript-eslint/no-unnecessary-type-parameters": "off",
      "@typescript-eslint/no-misused-spread": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-base-to-string": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "require-atomic-updates": "off",
    },
  },
];
