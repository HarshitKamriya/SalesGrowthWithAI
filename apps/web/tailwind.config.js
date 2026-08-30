/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e8ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#0f172a'
        },
        razorpay: {
          blue: '#0c2340',
          cyan: '#0284c7',
          accent: '#00d2ff'
        }
      }
    },
  },
  plugins: [],
}
