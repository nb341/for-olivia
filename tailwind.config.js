/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        rosewood: "#3b0a0f",
        velvet: "#7c0f1c",
        blush: "#f8d7dc",
        petal: "#f4b2bf",
        ember: "#b31b2c",
        gold: "#f0c56a",
        ivory: "#fdf6ef",
        cream: "#f9ede0",
        linen: "#f3e5d8",
        inkRose: "#4a0e16",
      },
      boxShadow: {
        glow: "0 0 35px rgba(179, 27, 44, 0.45)",
        soft: "0 20px 60px rgba(20, 6, 9, 0.35)",
        postcard:
          "0 8px 40px rgba(20, 6, 9, 0.25), 0 2px 8px rgba(20, 6, 9, 0.12)",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        script: ["Cinzel Decorative", "serif"],
        body: ["Cormorant Garamond", "serif"],
      },
    },
  },
  plugins: [],
};
