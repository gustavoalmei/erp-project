/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'color-bg-primary': 'var(--color-bg-primary)',
        'color-bg-secondary': 'var(--color-bg-secondary)',
        'color-surface': 'var(--color-surface)',

        /* Brand */
        'color-primary': 'var(--color-primary)',
        'color-primary-hover': 'var(--color-primary-hover)',
        'color-primary-active': 'var(--color-primary-active)',

        /* Text */
        'color-text-primary': 'var(--color-text-primary)',
        'color-text-secondary': 'var(--color-text-secondary)',
        'color-text-muted': 'var(--color-text-muted)',
        'color-text-inverse': 'var(--color-text-inverse)',

        /* Borders */
        'color-border-default': 'var(--color-border-default)',
        'color-border-strong': 'var(--color-border-strong)',

        /* UI */
        'color-hover': 'var(--color-hover)',
        'color-focus': 'var(--color-focus)',
        'color-disabled': 'var(--color-disabled)',

        /* Shadcn/ui compatibility */
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'muted-foreground': 'var(--muted-foreground)',
        border: 'rgb(var(--border) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
