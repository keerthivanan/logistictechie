/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        foreground: '#ffffff',
        primary: {
          DEFAULT: '#ffffff',
          foreground: '#000000',
        },
        secondary: {
          DEFAULT: '#27272a', // zinc-800
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#18181b', // zinc-900
          foreground: '#a1a1aa', // zinc-400
        },
        accent: {
          DEFAULT: '#ffffff',
          foreground: '#000000',
        },
      },
    },
  },
  plugins: [],
}
