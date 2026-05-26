import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#071120',
        'secondary-bg': '#0B1730',
        'card-bg': '#10213F',
        'elevated': '#13284D',
        'accent-primary': '#D6B98C',
        'accent-secondary': '#C8A97E',
        'accent-hover': '#E6C79C',
        'text-primary': '#F8F5F0',
        'text-muted': '#A8B3C7',
        'success': '#22C55E',
        'warning': '#F59E0B',
        'error': '#EF4444'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0, 0, 0, 0.45)',
        card: '0 10px 40px rgba(0, 0, 0, 0.45)',
        'glow-sm': '0 0 20px rgba(214, 185, 140, 0.15)',
        'glow': '0 0 30px rgba(214, 185, 140, 0.20)',
        'glow-lg': '0 10px 40px rgba(214, 185, 140, 0.25)'
      },
      backgroundImage: {
        'hero-fade': 'radial-gradient(circle at top, rgba(214,185,140,0.08), transparent 50%)',
        'accent-gradient': 'linear-gradient(135deg, #D6B98C, #C8A97E)'
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        'lg-premium': '20px',
        'xl-premium': '24px'
      }
    }
  },
  plugins: []
};

export default config;
