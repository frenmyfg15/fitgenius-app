/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        neon: {
          300: "rgb(102, 255, 102)",
          400: "rgb(57, 255, 20)",
          500: "rgb(0, 255, 64)",
          600: "rgb(46, 211, 16)",
          700: "rgb(35, 180, 14)",
          800: "rgb(28, 129, 10)",
        },
        "neon-purple": {
          300: "rgb(216, 0, 255)",
          400: "rgb(178, 0, 255)",
          500: "rgb(155, 0, 255)",
          600: "rgb(130, 0, 230)",
          700: "rgb(105, 0, 180)",
        },
      },
    },
  },
  plugins: [],
};
