
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
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
			fontFamily: {
				mono: ['SF Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'rgb(var(--border) / <alpha-value>)',
				input: 'rgb(var(--input) / <alpha-value>)',
				ring: 'rgb(var(--ring) / <alpha-value>)',
				background: 'rgb(var(--background) / <alpha-value>)',
				foreground: 'rgb(var(--foreground) / <alpha-value>)',
				primary: {
					DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
					foreground: 'rgb(var(--primary-foreground) / <alpha-value>)'
				},
				secondary: {
					DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
					foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)'
				},
				destructive: {
					DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
					foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)'
				},
				muted: {
					DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
					foreground: 'rgb(var(--muted-foreground) / <alpha-value>)'
				},
				accent: {
					DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
					foreground: 'rgb(var(--accent-foreground) / <alpha-value>)'
				},
				popover: {
					DEFAULT: 'rgb(var(--popover) / <alpha-value>)',
					foreground: 'rgb(var(--popover-foreground) / <alpha-value>)'
				},
				card: {
					DEFAULT: 'rgb(var(--card) / <alpha-value>)',
					foreground: 'rgb(var(--card-foreground) / <alpha-value>)'
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				'fade-out': {
					from: { opacity: '1' },
					to: { opacity: '0' }
				},
				'slide-up': {
					from: { transform: 'translateY(10px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-down': {
					from: { transform: 'translateY(-10px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' }
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-1000px 0' },
					'100%': { backgroundPosition: '1000px 0' }
				},
				'typewriter': {
					from: { width: '0' },
					to: { width: '100%' }
				},
				'blink': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0' }
				},
				'bounce-sm': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-2px)' }
				},
				'spin-slow': {
					from: { transform: 'rotate(0deg)' },
					to: { transform: 'rotate(360deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'slide-down': 'slide-down 0.3s ease-out',
				'pulse-slow': 'pulse-slow 3s infinite ease-in-out',
				'shimmer': 'shimmer 2s infinite linear',
				'typewriter': 'typewriter 2s steps(40, end)',
				'blink': 'blink 0.7s infinite',
				'bounce-sm': 'bounce-sm 1s ease-in-out infinite',
				'spin-slow': 'spin-slow 3s linear infinite'
			},
			backdropFilter: {
				'none': 'none',
				'blur': 'blur(20px)'
			},
			boxShadow: {
				'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
				'glass-lg': '0 8px 32px rgba(0, 0, 0, 0.1)',
				'elegant': '0 2px 10px rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.05)'
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: '65ch',
						a: {
							textDecoration: 'none',
							'&:hover': {
								textDecoration: 'underline',
							},
						},
					},
				},
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
