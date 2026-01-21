/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Fraunces", "ui-serif", "Georgia", "serif"],
      },
      colors: {
        ink: {
          900: "#0b0f1a",
          800: "#121826",
          700: "#1a2234",
        },
        sand: {
          50: "#f8f6f2",
          100: "#f1ede6",
          200: "#e4ddd2",
        },
        tide: {
          400: "#2db6a3",
          500: "#1a9a8c",
          600: "#0f7a70",
        },
        ember: {
          400: "#f59e0b",
          500: "#d97706",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(45,182,163,0.35), 0 12px 40px -20px rgba(15,122,112,0.6)",
      },
    },
  },
  plugins: [],
};
