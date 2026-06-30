/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#121212',
        surface: '#1E293B',
        module: {
          cookie: '#3B82F6',   // Neon Blue
          local: '#EF4444',    // Neon Red
          session: '#F97316',  // Neon Orange
          indexed: '#22C55E',  // Neon Green
          cache: '#06B6D4'     // Icy Cyan
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
