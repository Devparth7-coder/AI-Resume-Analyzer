/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08111d",
        glow: "#7dd3fc",
        mint: "#5eead4",
        coral: "#fb7185",
        panel: "#0f172a",
        panelAlt: "#111c2d",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        body: ['"DM Sans"', "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 70px rgba(15, 23, 42, 0.42)",
      },
    },
  },
  plugins: [],
};
