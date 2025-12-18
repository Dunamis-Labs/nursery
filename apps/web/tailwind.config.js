/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Design System Colors
        primary: {
          DEFAULT: '#2d5016',  // Forest Green
          light: '#4a7c2a',
          dark: '#1a3009',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#87a96b',  // Sage Green
          light: '#a8c48a',
          dark: '#6b8554',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#8b6f47',  // Warm Earth
          foreground: '#ffffff',
        },
        background: '#faf9f6',  // Cream White
        foreground: '#2c2c2c',   // Charcoal
        muted: {
          DEFAULT: '#6b7280',   // Gray
          foreground: '#ffffff',
        },
        border: '#e5e7eb',      // Light Gray
        // shadcn/ui compatibility (using HSL for CSS variables)
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: '8px',
        md: '6px',
        sm: '4px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

