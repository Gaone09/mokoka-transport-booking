/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0F1C2E", // Mokoka dark navy
        accent: "#2C6FB7", // Mokoka blue
        highlight: "#F5C400", // subtle gold
      },
    },
  },
  plugins: [],
};
