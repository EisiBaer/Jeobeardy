/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-prettier",
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "no-unused-vars": ["warn", { "argsIgnorePattern": "_.*"}],
    "vue/multi-word-component-names": "off",
    "prettier/prettier": "off",
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
};
