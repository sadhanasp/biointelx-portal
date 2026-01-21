/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        leaf: "#166534",
        lightleaf: "#dcfce7",
        soil: "#fefce8",
      },
    },
  },
  plugins: [],
};
