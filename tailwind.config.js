const defaultTheme = require('tailwindcss/defaultTheme')
const plugin = require('tailwindcss/plugin')
const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: ['./src/**/*.{ts,tsx}'],
    plugins: [
        require('tailwind-scrollbar'),
        require('daisyui'),
        plugin(function({ addBase }) {
            addBase({
                html: { fontSize: '14px' },
            })
        }),
    ],
    theme: {
        fontSize: {
            xs: ['0.75rem', { lineHeight: '1rem' }],
            sm: ['0.875rem', { lineHeight: '1.5rem' }],
            base: ['1rem', { lineHeight: '1.75rem' }],
            lg: ['1.125rem', { lineHeight: '2rem' }],
            xl: ['1.25rem', { lineHeight: '2rem' }],
            '2xl': ['1.5rem', { lineHeight: '2rem' }],
            '3xl': ['2rem', { lineHeight: '2.5rem' }],
            '4xl': ['2.5rem', { lineHeight: '3.5rem' }],
            '5xl': ['3rem', { lineHeight: '3.5rem' }],
            '6xl': ['3.75rem', { lineHeight: '1' }],
            '7xl': ['4.5rem', { lineHeight: '1.1' }],
            '8xl': ['6rem', { lineHeight: '1' }],
            '9xl': ['8rem', { lineHeight: '1' }],
        },
        extend: {
            borderRadius: {
                '4xl': '2rem',
            },
            fontFamily: {
                sans: ['montserrat', ...defaultTheme.fontFamily.sans],
                display: ['montserrat', ...defaultTheme.fontFamily.sans],
                title: ['Orbitron', ...defaultTheme.fontFamily.sans],
            },
            maxWidth: {
                '2xl': '40rem',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
            colors: {
                activeblue: '#225271',
                darkblue: '#023148',
                light: {
                    '100': '#f2f3f9',
                    '200': '#dbe8ea',
                },
                dark: '#020618',
                degenOrange: '#ff6c26',
                rusty: '#d64900',
                broccoli: '#00705a',
                techGreen: '#0f978e',
                persianGreen: '#00ac8c',
                seafoamGreen: '#78cc97',

                error: '#ff264d',
                success: '#00ac8c',
                yellow: '#ffd926',
            },
        },
    },
}
