// /** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter"],
        mono: ["JetBrains Mono"],
      },
      colors: {
        brand: {
          bg: "#0A0A0A",
          card: "#1F1F1F",
          nav: "#1A1A1A",
          text: "#FFFFFF",
          accent: "#F27D26",
        },
        status: {
          urgent: "#F27D26",
          pending: "#666666",
          done: "#4ADE80",
        },
      },
    },
  },
  plugins: [],
};