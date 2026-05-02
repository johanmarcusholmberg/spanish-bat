/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./contexts/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#F4926B",
        "primary-foreground": "#FFFFFF",
        secondary: "#ADBDAB",
        "secondary-foreground": "#2D3B2C",
        background: "#D9CFBC",
        foreground: "#1A1A1A",
        card: "#EDE8DF",
        "card-foreground": "#1A1A1A",
        muted: "#C5BAA8",
        "muted-foreground": "#6B6355",
        border: "#C5BAA8",
        destructive: "#E05C4B",
        "destructive-foreground": "#FFFFFF",
      },
      borderRadius: {
        DEFAULT: "12px",
      },
    },
  },
  plugins: [],
};
