/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF7A00', // Saffron
          light: '#FFA54F',
          dark: '#D66700',
        },
        secondary: {
          DEFAULT: '#1E3A8A', // Deep Blue
          light: '#3B82F6',
          dark: '#1E3A8A',
        },
        background: {
          DEFAULT: '#FFFFFF',
          light: '#F8FAFC',
        },
        charcoal: {
          DEFAULT: '#111827',
          light: '#4B5563',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.08)',
        'premium-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
        'saffron-glow': '0 10px 25px -5px rgba(255, 122, 0, 0.25)',
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
