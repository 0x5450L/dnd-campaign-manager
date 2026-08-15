import globals from "globals";
import base from "../eslint.base.mjs";

export default [
  { ignores: ["dist", "scripts"] },
  ...base,
  {
    files: ["**/*.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },
];
