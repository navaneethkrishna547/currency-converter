/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // This line is important for Vite projects if your index.html is in the root
    "./index.html",
    // This line tells Tailwind to scan all JS, JSX, TS, TSX files in your src/ directory
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

