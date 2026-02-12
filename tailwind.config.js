/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#92D0AA',
        secondary: '#636363',
        ternary: 'rgba(99, 99, 99, 0.5)',
        accent: '#92D0AA', // Primary Green
        'accent-strong': '#F1EB9C', // PANTONE 600 C - Yellow
        'accent-pink': '#FCEAE0', // Pink
        gray: '#f2f2f2',
        'accent-light': 'rgba(146, 208, 170, 0.1)', // Light version of primary green
        border: 'rgba(99, 99, 99, 0.3)',
      },
      fontFamily: {
        'engram': ['Engram WO5', 'system-ui', 'sans-serif'],
        'korean': ['YeogiOttaeJalnanGothic', 'sans-serif'],
        'sf-pro': ['SF Pro Display', 'system-ui', 'sans-serif'],
        'playfair': ['Playfair Display', 'serif'],
        'hello-seoul': ['Hello Seoul', 'sans-serif'],
        'grift': ['Grift Black', 'sans-serif'],
      },
      fontSize: {
        '100': '100px',
        '54': '54px',
        '36': '36px',
        '24': '24px',
        '18': '18px',
        '16': '16px',
        '14': '14px',
        '10': '10px',
      },
    },
  },
  plugins: [],
}
