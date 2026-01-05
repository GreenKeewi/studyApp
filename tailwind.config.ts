import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        dyslexic: ['OpenDyslexic', 'Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Light theme
        light: {
          bg: '#ffffff',
          surface: '#f8f9fa',
          border: '#e9ecef',
          text: {
            primary: '#212529',
            secondary: '#6c757d',
            tertiary: '#adb5bd',
          }
        },
        // Dark theme (default)
        dark: {
          bg: '#0d1117',
          surface: '#161b22',
          border: '#30363d',
          text: {
            primary: '#e6edf3',
            secondary: '#8b949e',
            tertiary: '#6e7681',
          }
        },
        // Dim theme
        dim: {
          bg: '#15202b',
          surface: '#1e2732',
          border: '#38444d',
          text: {
            primary: '#f7f9f9',
            secondary: '#8899a6',
            tertiary: '#657786',
          }
        },
        // Brand colors
        brand: {
          primary: '#8b5cf6',
          secondary: '#7c3aed',
          accent: '#a78bfa',
        }
      },
    },
  },
  plugins: [],
}
export default config
