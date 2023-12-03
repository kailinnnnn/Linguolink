/** @type {import('tailwindcss').Config} */

const { nextui } = require("@nextui-org/react");

module.exports = {
  content: [
    "./src/**/*.{html,js,jsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {},
    light: {
      colors: {
        background: "bg-gray-100",
      },
    },
    dark: {
      colors: {},
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
