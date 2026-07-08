import type { Config } from 'tailwindcss';

// 맘케어 웜 에디토리얼 디자인 토큰 (바닐라 styles.css와 동일)
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: { DEFAULT: '#FAF5EC', 2: '#F3EADB' },
        cream: '#FFFCF6',
        pine: { DEFAULT: '#16443C', 2: '#0E322C', soft: '#2E5A50' },
        terra: { DEFAULT: '#D96C4A', 2: '#C0532F' },
        amber: '#E6A15B',
        ink: { DEFAULT: '#241F1A', 2: '#4A423A' },
        muted: '#8B8073',
        line: '#E4DAC8',
        gold: '#C9A24B',
      },
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
        serif: ['"Noto Serif KR"', 'serif'],
      },
      borderRadius: {
        card: '20px',
      },
      boxShadow: {
        soft: '0 14px 40px -18px rgba(22,68,60,.35)',
        lg2: '0 40px 80px -30px rgba(22,68,60,.45)',
      },
    },
  },
  plugins: [],
};

export default config;
