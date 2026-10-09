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
        mono: ['ui-monospace', 'SFMono-Regular', '"Cascadia Mono"', 'Menlo', 'Consolas', 'monospace'],
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
        // Status hues for fills/borders; `*-fg` is the readable text tone
        // on light and dark surfaces (≥ 4.5:1 against card/background).
        success: { DEFAULT: 'hsl(var(--success))', fg: 'hsl(var(--success-fg))' },
        warning: { DEFAULT: 'hsl(var(--warning))', fg: 'hsl(var(--warning-fg))' },
        info: { DEFAULT: 'hsl(var(--info))', fg: 'hsl(var(--info-fg))' },
        danger: { DEFAULT: 'hsl(var(--destructive))', fg: 'hsl(var(--danger-fg))' },
        live: 'hsl(var(--live))',
        zone: { ucl: 'hsl(var(--zone-ucl))', rel: 'hsl(var(--zone-rel))' },
      },
      // The one radius scale (see tokens.css).
      borderRadius: {
        xs: 'var(--fg-radius-xs)',
        sm: 'var(--fg-radius-sm)',
        md: 'var(--fg-radius-md)',
        lg: 'var(--fg-radius-lg)',
        xl: 'var(--fg-radius-xl)',
        '2xl': 'var(--fg-radius-2xl)',
      },
      // Tailwind's default steps plus the fine steps used for glass surfaces.
      opacity: {
        2: '0.02',
        3: '0.03',
        4: '0.04',
        6: '0.06',
        8: '0.08',
        12: '0.12',
        18: '0.18',
      },
      letterSpacing: {
        // Uppercase eyebrow labels above headings.
        eyebrow: '0.16em',
      },
      fontSize: {
        // Smallest allowed text: 11px, only for dense badges/labels.
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      zIndex: {
        sticky: 'var(--fg-z-sticky)',
        header: 'var(--fg-z-header)',
        nav: 'var(--fg-z-nav)',
        fab: 'var(--fg-z-fab)',
        modal: 'var(--fg-z-modal)',
        banner: 'var(--fg-z-banner)',
        toast: 'var(--fg-z-toast)',
        tooltip: 'var(--fg-z-tooltip)',
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
        // Shell geometry (tokens.css › Layout).
        sidebar: 'var(--fg-sidebar-width)',
        header: 'var(--fg-header-height)',
        tabbar: 'var(--fg-tabbar-height)',
        shell: 'var(--fg-shell-offset)',
        'shell-gutter': 'var(--fg-shell-gutter)',
        'header-offset': 'var(--fg-header-offset)',
        'tabbar-clearance': 'var(--fg-tabbar-clearance)',
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
        'fg-enter': 'var(--fg-ease-enter)',
        'fg-soft': 'var(--fg-ease-soft)',
        'fg-exit': 'var(--fg-ease-exit)',
      },
      transitionDuration: {
        'fg-instant': 'var(--fg-duration-instant)',
        'fg-fast': 'var(--fg-duration-fast)',
        'fg-base': 'var(--fg-duration-base)',
        'fg-slow': 'var(--fg-duration-slow)',
        'fg-hero': 'var(--fg-duration-hero)',
      },
      maxWidth: {
        'fg-content': 'var(--fg-content-max)',
        'fg-narrow': 'var(--fg-content-narrow)',
        shell: 'var(--fg-shell-max)',
      },
    },
  },
  plugins: [animate, typography],
} satisfies Config

export default config
