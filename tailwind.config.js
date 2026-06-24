/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 36px rgba(20, 184, 166, 0.18)",
        panel: "0 24px 80px rgba(0, 0, 0, 0.28)",
      },
    },
  },
  plugins: [],
};
