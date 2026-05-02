/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#f5eee8",
        blush: "#f3d9d0",
        clay: "#c58f68",
        espresso: "#3e2a23",
        pine: "#465147"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(62, 42, 35, 0.10)"
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["Trebuchet MS", "sans-serif"]
      }
    }
  },
  plugins: []
};
