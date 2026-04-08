import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        philsa: {
          navy:    '#0d1b2a',
          mid:     '#132338',
          light:   '#1c3354',
          blue:    '#1a5276',
          accent:  '#2e86c1',
          bright:  '#3498db',
          gold:    '#c9a84c',
        },
        tier: {
          urgent:   '#c0392b',
          high:     '#d68910',
          moderate: '#1a5276',
          low:      '#1e8449',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono:  ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'card':   '0 4px 24px rgba(0,0,0,0.4)',
        'card-sm':'0 2px 12px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
