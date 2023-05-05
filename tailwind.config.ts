import type { Config } from 'tailwindcss'
const { fontFamily } = require('tailwindcss/defaultTheme')

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        lobster: ['var(--font-lobster)', 'cursive'],
        sans: ['var(--font-ibm-plex-sans)', ...fontFamily.sans],
        mono: ['var(--font-ibm-plex-mono)', ...fontFamily.mono],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@catppuccin/tailwindcss'),
  ],
} satisfies Config
