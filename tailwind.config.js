/** @type {import('tailwindcss').Config} */

const { nextui } = require("@nextui-org/react");

module.exports = {
  content: [
    "./src/**/*.{html,js,jsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {},
    colors: {
      purple100: "#f3eeff",
      purple300: "#9d6cff",
      purple500: "#7c4af6",

      white: "#ffffff",
      bgWhite: "#f8f8f8",
      gray100: "#f5f5f8",
      gray300: "#e5e7eb",
      gray500: "#9ca3af",
      gray700: "#374151",
      black: "#111827",
      transparentWhite: "rgb(255, 255, 255,0.2)",
      red500: "#ef4444",
      green500: "#22c55e",
      // white: "#ffffff",
    },
    fontFamily: {
      inter: ["Inter", "sans-serif"],
      righteous: ["Righteous", "sans-serif"],
      "noto-sans-tc": ["Noto Sans TC", "sans-serif"],
      poppins: ["Poppins", "sans-serif"],
      pacifico: ["Pacifico", "sans-serif"],
      courgette: ["Courgette"],
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
