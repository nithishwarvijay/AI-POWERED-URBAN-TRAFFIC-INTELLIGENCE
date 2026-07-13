/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1e40af",
        danger: "#dc2626",
        success: "#16a34a",
      },
    },
  },
  plugins: [],
};
