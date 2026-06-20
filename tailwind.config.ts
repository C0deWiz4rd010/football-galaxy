import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'
import typography from '@tailwindcss/typography'

const config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        pl: '#3d195b',
        bl: '#d3010c',
        ll: '#003f8f',
        sa: '#009246',
        l1: '#091c3e',
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        info: 'hsl(var(--info))',
        live: 'hsl(var(--live))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // Design-token aligned radii. Prefer these in new components so the
        // radius scale stays consistent across pages.
        'fg-xs': 'var(--fg-radius-xs)',
        'fg-sm': 'var(--fg-radius-sm)',
        'fg-md': 'var(--fg-radius-md)',
        'fg-lg': 'var(--fg-radius-lg)',
        'fg-xl': 'var(--fg-radius-xl)',
        'fg-2xl': 'var(--fg-radius-2xl)',
        'fg-pill': 'var(--fg-radius-pill)',
      },
      spacing: {
        // 4px scale mirroring tokens.css. These coexist with Tailwind's
        // default spacing scale; use whichever reads clearer in context.
        'fg-1': 'var(--fg-space-1)',
        'fg-2': 'var(--fg-space-2)',
        'fg-3': 'var(--fg-space-3)',
        'fg-4': 'var(--fg-space-4)',
        'fg-5': 'var(--fg-space-5)',
        'fg-6': 'var(--fg-space-6)',
        'fg-7': 'var(--fg-space-7)',
        'fg-8': 'var(--fg-space-8)',
        'fg-9': 'var(--fg-space-9)',
        'fg-10': 'var(--fg-space-10)',
        'fg-11': 'var(--fg-space-11)',
        'fg-12': 'var(--fg-space-12)',
      },
      boxShadow: {
        'fg-1': 'var(--fg-elevation-1)',
        'fg-2': 'var(--fg-elevation-2)',
        'fg-3': 'var(--fg-elevation-3)',
        'fg-4': 'var(--fg-elevation-4)',
        'fg-5': 'var(--fg-elevation-5)',
      },
      transitionTimingFunction: {
        'fg-standard': 'var(--fg-ease-standard)',
        'fg-emphasized': 'var(--fg-ease-emphasized)',
        'fg-decelerate': 'var(--fg-ease-decelerate)',
        'fg-accelerate': 'var(--fg-ease-accelerate)',
      },
      transitionDuration: {
        'fg-instant': '100ms',
        'fg-fast': '160ms',
        'fg-base': '240ms',
        'fg-slow': '320ms',
        'fg-slower': '420ms',
        'fg-hero': '560ms',
      },
      maxWidth: {
        'fg-content': 'var(--fg-content-max)',
        'fg-narrow': 'var(--fg-content-narrow)',
      },
    },
  },
  plugins: [animate, typography],
} satisfies Config

export default config
