import type { Config } from 'tailwindcss';

// 케어빌리지(CareVillage) 브랜드 디자인 토큰
// 세이지그린(신뢰) · 크림아이보리(따뜻) · 피치(사랑) · 스카이블루(안심)
// 토큰 이름은 유지하고 값만 소프트 팔레트로 교체 (pine=세이지, terra=피치)
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: { DEFAULT: '#F7F3E9', 2: '#EFE7D8' }, // 크림 아이보리 (따뜻함)
        cream: '#FFFDF8',
        pine: { DEFAULT: '#3E5D4F', 2: '#2C4638', soft: '#7A9B86' }, // 세이지 그린 (신뢰·안정)
        terra: { DEFAULT: '#E0885F', 2: '#C97050' }, // 피치 (사랑·배려)
        amber: '#E6A15B',
        sky: { DEFAULT: '#9BC4DB', deep: '#5B92B0' }, // 소프트 스카이블루 (안전·안심)
        ink: { DEFAULT: '#2C2823', 2: '#4A423A' }, // 짙은 회색
        muted: '#8B8073',
        line: '#E7DFD0',
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
        soft: '0 14px 40px -18px rgba(62,93,79,.30)',
        lg2: '0 40px 80px -30px rgba(62,93,79,.38)',
      },
    },
  },
  plugins: [],
};

export default config;
