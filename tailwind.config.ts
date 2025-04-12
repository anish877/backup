// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
      "./pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    prefix: "",
    theme: {
      container: {
        center: true,
        padding: '2rem',
        screens: {
          '2xl': '1400px'
        }
      },
      extend: {
        colors: {
          // Use traditional color values instead of CSS variables for compatibility
          "border": "hsl(214.3, 31.8%, 91.4%)",
          "input": "hsl(214.3, 31.8%, 91.4%)",
          "ring": "hsl(222.2, 84%, 4.9%)",
          "background": "hsl(0, 0%, 100%)",
          "foreground": "hsl(222.2, 84%, 4.9%)",
          
          primary: {
            DEFAULT: "#FF5500", // Brand orange color
            foreground: "#FFFFFF",
          },
          secondary: {
            DEFAULT: "hsl(210, 40%, 96.1%)",
            foreground: "hsl(222.2, 47.4%, 11.2%)",
          },
          destructive: {
            DEFAULT: "hsl(0, 84.2%, 60.2%)",
            foreground: "hsl(210, 40%, 98%)",
          },
          muted: {
            DEFAULT: "hsl(210, 40%, 96.1%)",
            foreground: "hsl(215.4, 16.3%, 46.9%)",
          },
          accent: {
            DEFAULT: "hsl(210, 40%, 96.1%)",
            foreground: "hsl(222.2, 47.4%, 11.2%)",
          },
          popover: {
            DEFAULT: "hsl(0, 0%, 100%)",
            foreground: "hsl(222.2, 84%, 4.9%)",
          },
          card: {
            DEFAULT: "hsl(0, 0%, 100%)",
            foreground: "hsl(222.2, 84%, 4.9%)",
          },
          
          // Direct color definitions for simpler usage
          brandOrange: {
            DEFAULT: '#FF5500',
            light: '#FF7A33',
            dark: '#E64D00'
          },
          darkBg: '#121212',
          darkCard: '#1E1E1E',
          chartGreen: '#4CAF50',
          chartBlue: '#2196F3',
          chartPurple: '#9C27B0',
          
          // Add dark mode variants directly
          dark: {
            background: "hsl(0, 0%, 7%)",
            foreground: "hsl(210, 40%, 98%)",
            card: "hsl(222.2, 84%, 4.9%)",
            "card-foreground": "hsl(210, 40%, 98%)",
            // Add other dark mode colors as needed
          }
        },
        borderRadius: {
          lg: '0.75rem', // Use direct values instead of CSS variables
          md: '0.5rem',
          sm: '0.25rem'
        },
        keyframes: {
          'accordion-down': {
            from: { height: '0' },
            to: { height: 'var(--radix-accordion-content-height)' }
          },
          'accordion-up': {
            from: { height: 'var(--radix-accordion-content-height)' },
            to: { height: '0' }
          }
        },
        animation: {
          'accordion-down': 'accordion-down 0.2s ease-out',
          'accordion-up': 'accordion-up 0.2s ease-out'
        }
      }
    },
    plugins: [require("tailwindcss-animate")]
  }