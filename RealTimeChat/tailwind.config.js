/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        whatsapp: {
          teal: {
            light: '#008069',
            dark: '#00a884'
          },
          bg: {
            light: '#efeae2',
            dark: '#0b141a'
          },
          panel: {
            light: '#f0f2f5',
            dark: '#202c33'
          },
          bubble: {
            own: {
              light: '#d9fdd3',
              dark: '#005c4b'
            },
            other: {
              light: '#ffffff',
              dark: '#202c33'
            }
          }
        },
        "primary-fixed-dim": "#3de273",
        "on-background": "#151e16",
        "tertiary-container": "#ffa07e",
        "on-secondary": "#ffffff",
        "tertiary-fixed": "#ffdbcf",
        "on-primary-fixed-variant": "#005322",
        "inverse-surface": "#2a332a",
        "surface-container-low": "#edf6e9",
        "background": "#f3fcef",
        "surface-tint": "#006d2f",
        "surface-bright": "#f3fcef",
        "surface-container": "#e7f1e4",
        "on-secondary-fixed-variant": "#003ea8",
        "on-primary-fixed": "#002109",
        "on-secondary-container": "#fefcff",
        "primary-container": "#25d366",
        "tertiary-fixed-dim": "#ffb59b",
        "on-secondary-fixed": "#00174b",
        "surface-container-high": "#e2ebde",
        "surface-container-highest": "#dce5d8",
        "surface-dim": "#d3ddd0",
        "secondary-container": "#316bf3",
        "primary-fixed": "#66ff8e",
        "on-surface-variant": "#3c4a3d",
        "inverse-primary": "#3de273",
        "on-tertiary-fixed": "#380d00",
        "secondary-fixed-dim": "#b4c5ff",
        "inverse-on-surface": "#eaf3e6",
        "surface-variant": "#dce5d8",
        "on-tertiary-container": "#78351b",
        "on-error-container": "#93000a",
        "error-container": "#ffdad6",
        "tertiary": "#93492e",
        "on-surface": "#151e16",
        "secondary": "#0051d5",
        "surface-container-lowest": "#ffffff",
        "on-tertiary": "#ffffff",
        "on-primary": "#ffffff",
        "outline": "#6c7b6b",
        "primary": "#006d2f",
        "outline-variant": "#bbcbb9",
        "on-tertiary-fixed-variant": "#763319",
        "error": "#ba1a1a",
        "surface": "#f3fcef",
        "on-primary-container": "#005523",
        "on-error": "#ffffff",
        "secondary-fixed": "#dbe1ff"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "bubble-gap-same": "0.125rem",
        "bubble-gap-different": "0.75rem",
        "avatar-size-md": "3.5rem",
        "avatar-size-sm": "2.5rem",
        "container-padding": "1rem",
        "gutter": "1rem"
      },
      fontFamily: {
        "timestamp": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "label-caps": ["Inter", "sans-serif"],
        "h1": ["Inter", "sans-serif"],
        "h2": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"]
      },
      fontSize: {
        "timestamp": ["11px", { "lineHeight": "14px", "fontWeight": "400" }],
        "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "label-caps": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "h1": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "h2": ["20px", { "lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }]
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      }
    },
  },
  plugins: [],
}
