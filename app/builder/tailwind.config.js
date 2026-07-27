/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    theme: {
      extend: { //extending for the animation in CodeEditor before actual code generation!!!
        keyframes: {
          scan: {
            "0%": { transform: "translateY(0)" },
            "100%": { transform: "translateY(100vh)" },
          },
        },
        animation: {
          scan: "scan 2.5s ease-in-out infinite",
        },
      },
    },
  },
  plugins: [],
};