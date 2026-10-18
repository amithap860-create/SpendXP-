import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-yanone)', 'Arial Narrow', 'system-ui', 'sans-serif'],
        body: ['var(--font-yanone)', 'Arial Narrow', 'sans-serif'],
        headline: ['var(--font-yanone)', 'Arial Narrow', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        green: { '50': 'rgb(var(--p-green-50) / <alpha-value>)', '100': 'rgb(var(--p-green-100) / <alpha-value>)', '200': 'rgb(var(--p-green-200) / <alpha-value>)', '300': 'rgb(var(--p-green-300) / <alpha-value>)', '400': 'rgb(var(--p-green-400) / <alpha-value>)', '500': 'rgb(var(--p-green-500) / <alpha-value>)', '600': 'rgb(var(--p-green-600) / <alpha-value>)', '700': 'rgb(var(--p-green-700) / <alpha-value>)', '800': 'rgb(var(--p-green-800) / <alpha-value>)', '900': 'rgb(var(--p-green-900) / <alpha-value>)', '950': 'rgb(var(--p-green-950) / <alpha-value>)' },
        emerald: { '50': 'rgb(var(--p-green-50) / <alpha-value>)', '100': 'rgb(var(--p-green-100) / <alpha-value>)', '200': 'rgb(var(--p-green-200) / <alpha-value>)', '300': 'rgb(var(--p-green-300) / <alpha-value>)', '400': 'rgb(var(--p-green-400) / <alpha-value>)', '500': 'rgb(var(--p-green-500) / <alpha-value>)', '600': 'rgb(var(--p-green-600) / <alpha-value>)', '700': 'rgb(var(--p-green-700) / <alpha-value>)', '800': 'rgb(var(--p-green-800) / <alpha-value>)', '900': 'rgb(var(--p-green-900) / <alpha-value>)', '950': 'rgb(var(--p-green-950) / <alpha-value>)' },
        teal: { '50': 'rgb(var(--p-green-50) / <alpha-value>)', '100': 'rgb(var(--p-green-100) / <alpha-value>)', '200': 'rgb(var(--p-green-200) / <alpha-value>)', '300': 'rgb(var(--p-green-300) / <alpha-value>)', '400': 'rgb(var(--p-green-400) / <alpha-value>)', '500': 'rgb(var(--p-green-500) / <alpha-value>)', '600': 'rgb(var(--p-green-600) / <alpha-value>)', '700': 'rgb(var(--p-green-700) / <alpha-value>)', '800': 'rgb(var(--p-green-800) / <alpha-value>)', '900': 'rgb(var(--p-green-900) / <alpha-value>)', '950': 'rgb(var(--p-green-950) / <alpha-value>)' },
        lime: { '50': 'rgb(var(--p-green-50) / <alpha-value>)', '100': 'rgb(var(--p-green-100) / <alpha-value>)', '200': 'rgb(var(--p-green-200) / <alpha-value>)', '300': 'rgb(var(--p-green-300) / <alpha-value>)', '400': 'rgb(var(--p-green-400) / <alpha-value>)', '500': 'rgb(var(--p-green-500) / <alpha-value>)', '600': 'rgb(var(--p-green-600) / <alpha-value>)', '700': 'rgb(var(--p-green-700) / <alpha-value>)', '800': 'rgb(var(--p-green-800) / <alpha-value>)', '900': 'rgb(var(--p-green-900) / <alpha-value>)', '950': 'rgb(var(--p-green-950) / <alpha-value>)' },
        rose: { '50': 'rgb(var(--p-rose-50) / <alpha-value>)', '100': 'rgb(var(--p-rose-100) / <alpha-value>)', '200': 'rgb(var(--p-rose-200) / <alpha-value>)', '300': 'rgb(var(--p-rose-300) / <alpha-value>)', '400': 'rgb(var(--p-rose-400) / <alpha-value>)', '500': 'rgb(var(--p-rose-500) / <alpha-value>)', '600': 'rgb(var(--p-rose-600) / <alpha-value>)', '700': 'rgb(var(--p-rose-700) / <alpha-value>)', '800': 'rgb(var(--p-rose-800) / <alpha-value>)', '900': 'rgb(var(--p-rose-900) / <alpha-value>)', '950': 'rgb(var(--p-rose-950) / <alpha-value>)' },
        red: { '50': 'rgb(var(--p-rose-50) / <alpha-value>)', '100': 'rgb(var(--p-rose-100) / <alpha-value>)', '200': 'rgb(var(--p-rose-200) / <alpha-value>)', '300': 'rgb(var(--p-rose-300) / <alpha-value>)', '400': 'rgb(var(--p-rose-400) / <alpha-value>)', '500': 'rgb(var(--p-rose-500) / <alpha-value>)', '600': 'rgb(var(--p-rose-600) / <alpha-value>)', '700': 'rgb(var(--p-rose-700) / <alpha-value>)', '800': 'rgb(var(--p-rose-800) / <alpha-value>)', '900': 'rgb(var(--p-rose-900) / <alpha-value>)', '950': 'rgb(var(--p-rose-950) / <alpha-value>)' },
        pink: { '50': 'rgb(var(--p-rose-50) / <alpha-value>)', '100': 'rgb(var(--p-rose-100) / <alpha-value>)', '200': 'rgb(var(--p-rose-200) / <alpha-value>)', '300': 'rgb(var(--p-rose-300) / <alpha-value>)', '400': 'rgb(var(--p-rose-400) / <alpha-value>)', '500': 'rgb(var(--p-rose-500) / <alpha-value>)', '600': 'rgb(var(--p-rose-600) / <alpha-value>)', '700': 'rgb(var(--p-rose-700) / <alpha-value>)', '800': 'rgb(var(--p-rose-800) / <alpha-value>)', '900': 'rgb(var(--p-rose-900) / <alpha-value>)', '950': 'rgb(var(--p-rose-950) / <alpha-value>)' },
        amber: { '50': 'rgb(var(--p-amber-50) / <alpha-value>)', '100': 'rgb(var(--p-amber-100) / <alpha-value>)', '200': 'rgb(var(--p-amber-200) / <alpha-value>)', '300': 'rgb(var(--p-amber-300) / <alpha-value>)', '400': 'rgb(var(--p-amber-400) / <alpha-value>)', '500': 'rgb(var(--p-amber-500) / <alpha-value>)', '600': 'rgb(var(--p-amber-600) / <alpha-value>)', '700': 'rgb(var(--p-amber-700) / <alpha-value>)', '800': 'rgb(var(--p-amber-800) / <alpha-value>)', '900': 'rgb(var(--p-amber-900) / <alpha-value>)', '950': 'rgb(var(--p-amber-950) / <alpha-value>)' },
        yellow: { '50': 'rgb(var(--p-amber-50) / <alpha-value>)', '100': 'rgb(var(--p-amber-100) / <alpha-value>)', '200': 'rgb(var(--p-amber-200) / <alpha-value>)', '300': 'rgb(var(--p-amber-300) / <alpha-value>)', '400': 'rgb(var(--p-amber-400) / <alpha-value>)', '500': 'rgb(var(--p-amber-500) / <alpha-value>)', '600': 'rgb(var(--p-amber-600) / <alpha-value>)', '700': 'rgb(var(--p-amber-700) / <alpha-value>)', '800': 'rgb(var(--p-amber-800) / <alpha-value>)', '900': 'rgb(var(--p-amber-900) / <alpha-value>)', '950': 'rgb(var(--p-amber-950) / <alpha-value>)' },
        orange: { '50': 'rgb(var(--p-amber-50) / <alpha-value>)', '100': 'rgb(var(--p-amber-100) / <alpha-value>)', '200': 'rgb(var(--p-amber-200) / <alpha-value>)', '300': 'rgb(var(--p-amber-300) / <alpha-value>)', '400': 'rgb(var(--p-amber-400) / <alpha-value>)', '500': 'rgb(var(--p-amber-500) / <alpha-value>)', '600': 'rgb(var(--p-amber-600) / <alpha-value>)', '700': 'rgb(var(--p-amber-700) / <alpha-value>)', '800': 'rgb(var(--p-amber-800) / <alpha-value>)', '900': 'rgb(var(--p-amber-900) / <alpha-value>)', '950': 'rgb(var(--p-amber-950) / <alpha-value>)' },
        blue: { '50': 'rgb(var(--p-blue-50) / <alpha-value>)', '100': 'rgb(var(--p-blue-100) / <alpha-value>)', '200': 'rgb(var(--p-blue-200) / <alpha-value>)', '300': 'rgb(var(--p-blue-300) / <alpha-value>)', '400': 'rgb(var(--p-blue-400) / <alpha-value>)', '500': 'rgb(var(--p-blue-500) / <alpha-value>)', '600': 'rgb(var(--p-blue-600) / <alpha-value>)', '700': 'rgb(var(--p-blue-700) / <alpha-value>)', '800': 'rgb(var(--p-blue-800) / <alpha-value>)', '900': 'rgb(var(--p-blue-900) / <alpha-value>)', '950': 'rgb(var(--p-blue-950) / <alpha-value>)' },
        sky: { '50': 'rgb(var(--p-blue-50) / <alpha-value>)', '100': 'rgb(var(--p-blue-100) / <alpha-value>)', '200': 'rgb(var(--p-blue-200) / <alpha-value>)', '300': 'rgb(var(--p-blue-300) / <alpha-value>)', '400': 'rgb(var(--p-blue-400) / <alpha-value>)', '500': 'rgb(var(--p-blue-500) / <alpha-value>)', '600': 'rgb(var(--p-blue-600) / <alpha-value>)', '700': 'rgb(var(--p-blue-700) / <alpha-value>)', '800': 'rgb(var(--p-blue-800) / <alpha-value>)', '900': 'rgb(var(--p-blue-900) / <alpha-value>)', '950': 'rgb(var(--p-blue-950) / <alpha-value>)' },
        indigo: { '50': 'rgb(var(--p-blue-50) / <alpha-value>)', '100': 'rgb(var(--p-blue-100) / <alpha-value>)', '200': 'rgb(var(--p-blue-200) / <alpha-value>)', '300': 'rgb(var(--p-blue-300) / <alpha-value>)', '400': 'rgb(var(--p-blue-400) / <alpha-value>)', '500': 'rgb(var(--p-blue-500) / <alpha-value>)', '600': 'rgb(var(--p-blue-600) / <alpha-value>)', '700': 'rgb(var(--p-blue-700) / <alpha-value>)', '800': 'rgb(var(--p-blue-800) / <alpha-value>)', '900': 'rgb(var(--p-blue-900) / <alpha-value>)', '950': 'rgb(var(--p-blue-950) / <alpha-value>)' },
        cyan: { '50': 'rgb(var(--p-blue-50) / <alpha-value>)', '100': 'rgb(var(--p-blue-100) / <alpha-value>)', '200': 'rgb(var(--p-blue-200) / <alpha-value>)', '300': 'rgb(var(--p-blue-300) / <alpha-value>)', '400': 'rgb(var(--p-blue-400) / <alpha-value>)', '500': 'rgb(var(--p-blue-500) / <alpha-value>)', '600': 'rgb(var(--p-blue-600) / <alpha-value>)', '700': 'rgb(var(--p-blue-700) / <alpha-value>)', '800': 'rgb(var(--p-blue-800) / <alpha-value>)', '900': 'rgb(var(--p-blue-900) / <alpha-value>)', '950': 'rgb(var(--p-blue-950) / <alpha-value>)' },
        violet: { '50': 'rgb(var(--p-blue-50) / <alpha-value>)', '100': 'rgb(var(--p-blue-100) / <alpha-value>)', '200': 'rgb(var(--p-blue-200) / <alpha-value>)', '300': 'rgb(var(--p-blue-300) / <alpha-value>)', '400': 'rgb(var(--p-blue-400) / <alpha-value>)', '500': 'rgb(var(--p-blue-500) / <alpha-value>)', '600': 'rgb(var(--p-blue-600) / <alpha-value>)', '700': 'rgb(var(--p-blue-700) / <alpha-value>)', '800': 'rgb(var(--p-blue-800) / <alpha-value>)', '900': 'rgb(var(--p-blue-900) / <alpha-value>)', '950': 'rgb(var(--p-blue-950) / <alpha-value>)' },
        purple: { '50': 'rgb(var(--p-blue-50) / <alpha-value>)', '100': 'rgb(var(--p-blue-100) / <alpha-value>)', '200': 'rgb(var(--p-blue-200) / <alpha-value>)', '300': 'rgb(var(--p-blue-300) / <alpha-value>)', '400': 'rgb(var(--p-blue-400) / <alpha-value>)', '500': 'rgb(var(--p-blue-500) / <alpha-value>)', '600': 'rgb(var(--p-blue-600) / <alpha-value>)', '700': 'rgb(var(--p-blue-700) / <alpha-value>)', '800': 'rgb(var(--p-blue-800) / <alpha-value>)', '900': 'rgb(var(--p-blue-900) / <alpha-value>)', '950': 'rgb(var(--p-blue-950) / <alpha-value>)' },
        gold: { DEFAULT: 'hsl(var(--gold))', foreground: 'hsl(var(--gold-foreground))' },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        // Category / feedback colors for games (added 2026-09-30) — see the
        // long comment above these tokens in globals.css for why they exist.
        // Use bg-cat-want / text-cat-streak / border-cat-wrong etc. instead
        // of a raw Tailwind color whenever a game needs to color-code NEED
        // vs WANT vs SAVE, correct vs wrong, or a streak indicator.
        cat: {
          need: 'hsl(var(--cat-need))',
          'need-foreground': 'hsl(var(--cat-need-foreground))',
          want: 'hsl(var(--cat-want))',
          'want-foreground': 'hsl(var(--cat-want-foreground))',
          save: 'hsl(var(--cat-save))',
          'save-foreground': 'hsl(var(--cat-save-foreground))',
          streak: 'hsl(var(--cat-streak))',
          'streak-foreground': 'hsl(var(--cat-streak-foreground))',
          correct: 'hsl(var(--cat-correct))',
          'correct-foreground': 'hsl(var(--cat-correct-foreground))',
          wrong: 'hsl(var(--cat-wrong))',
          'wrong-foreground': 'hsl(var(--cat-wrong-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      minHeight: {
        'screen-safe': '100dvh',
      },
      height: {
        'screen-safe': '100dvh',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
