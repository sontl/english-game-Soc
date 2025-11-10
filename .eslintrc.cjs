module.exports = {
  root: true,
  extends: ["eslint:recommended"],
  env: {
    es2021: true,
    browser: true,
    node: true
  },
  ignorePatterns: ["dist", "node_modules", "coverage"],
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      },
      plugins: ["@typescript-eslint"],
      extends: [
        "plugin:@typescript-eslint/recommended"
      ]
    },
    {
      files: ["frontend/**/*"],
      env: {
        browser: true
      }
    },
    {
      files: ["backend/**/*"],
      env: {
        node: true
      }
    }
  ]
};
