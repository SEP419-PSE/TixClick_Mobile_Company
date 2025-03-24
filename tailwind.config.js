/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "pse-green": "#ff8a00",
        "pse-green-second": "#ff9601",
        "pse-green-third": "#ff9601bf",
        "pse-black": "#1a1a1a",
        "pse-black-light": "#252525",
        "pse-gray": "#828282",
        "pse-header": "#111111",
        "pse-footer": "#060606",
        "pse-text": "#ffffff",
        "pse-error": "#ff0000"
      },
    },
    fontFamily: {
      inter: ["Inter", "sans-serif"],
    },
  },
  plugins: [],
}