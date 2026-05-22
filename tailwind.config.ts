import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        muted: '#667085',
        line: '#e6eaf0',
        brand: '#2563eb',
        soft: '#f5f7fb'
      },
      boxShadow: {
        panel: '0 18px 45px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};

export default config;
