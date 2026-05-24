/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "azul-profundo":    "#21145F",
        "azul-institucional": "#1A428A",
        "amarillo":         "#FFCC00",
        "azul-noche":       "#0E0A35",
        "gris-suave":       "#F7F8FC",
      },
      fontFamily: {
        sans:    ["'Poppins'", "sans-serif"],
        display: ["'Montserrat'", "sans-serif"],
        serif:   ["'Playfair Display'", "serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
  plugins: [],
};
