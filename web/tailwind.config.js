module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {colors: {
      // Make sure 'navy' and 'dark-gray' are defined if you use them
      'navy': '#00A0FF', // Or your specific navy hex code
      'dark-gray': '#334155', // Example dark gray (Tailwind's slate-700)
      // ... other custom colors
    },
  },
  },
  plugins: [],
}