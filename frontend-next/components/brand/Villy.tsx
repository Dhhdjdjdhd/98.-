// 케어빌리지 마스코트 "빌리(Villy)" — 하트와 세이지 스카프를 두른 새
// "부모와 아이를 따뜻하게 이어주는 메신저"
export function Villy({ size = 96, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 130"
      className={className}
      role="img"
      aria-label="케어빌리지 마스코트 빌리"
    >
      {/* 머리 위 새싹 (마을·자연) */}
      <path d="M60 20 C58 10 52 6 46 6 C50 14 55 18 60 22 Z" fill="#7A9B86" />
      <path d="M60 20 C62 11 68 8 73 9 C69 16 65 19 60 22 Z" fill="#8FAE9C" />

      {/* 다리 */}
      <path d="M50 108 L50 118" stroke="#E0A15B" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M70 108 L70 118" stroke="#E0A15B" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M46 118 L54 118 M66 118 L74 118" stroke="#E0A15B" strokeWidth="3.5" strokeLinecap="round" />

      {/* 몸통 (피치) */}
      <ellipse cx="60" cy="64" rx="40" ry="43" fill="#EFB78F" />
      {/* 배 (크림) */}
      <ellipse cx="60" cy="74" rx="26" ry="29" fill="#FBEEDF" />

      {/* 날개 */}
      <path d="M97 60 C106 66 106 82 96 88 C93 78 92 68 97 60 Z" fill="#E0885F" />
      <path d="M23 60 C14 66 14 82 24 88 C27 78 28 68 23 60 Z" fill="#E0885F" />

      {/* 볼터치 */}
      <circle cx="42" cy="66" r="5.5" fill="#F0A9A0" opacity="0.75" />
      <circle cx="78" cy="66" r="5.5" fill="#F0A9A0" opacity="0.75" />

      {/* 눈 */}
      <circle cx="49" cy="56" r="5" fill="#2C2823" />
      <circle cx="71" cy="56" r="5" fill="#2C2823" />
      <circle cx="50.6" cy="54.2" r="1.7" fill="#fff" />
      <circle cx="72.6" cy="54.2" r="1.7" fill="#fff" />

      {/* 부리 */}
      <path d="M60 61 L66 66 L60 71 L54 66 Z" fill="#E6A15B" />

      {/* 세이지 스카프 */}
      <path d="M26 88 C44 100 76 100 94 88 L94 96 C76 108 44 108 26 96 Z" fill="#7A9B86" />
      <path d="M38 97 L33 116 L44 111 L42 100 Z" fill="#6B8E7B" />

      {/* 가슴 하트 */}
      <path
        d="M60 76 C57 71 49 72 49 78 C49 83 55 87 60 91 C65 87 71 83 71 78 C71 72 63 71 60 76 Z"
        fill="#E06B6B"
      />
    </svg>
  );
}
