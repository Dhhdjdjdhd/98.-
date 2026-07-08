import type { Metadata, Viewport } from 'next';
import './globals.css';
import './landing.css';

export const metadata: Metadata = {
  title: '케어빌리지(CareVillage) — 의료전문가 기반 프리미엄 육아 매칭',
  description:
    '간호사·간호조무사 등 검증된 돌봄 전문가를 필요한 시간에 연결하는 프리미엄 육아 플랫폼. 한 아이를 키우는 온 마을을 디지털로 연결합니다.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* 실제 모바일 기기 감지 → <html>.mc-mobile (body 렌더 전 실행) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var ua=navigator.userAgent||'';var m=(navigator.userAgentData&&navigator.userAgentData.mobile===true)||/iPhone|iPod|Android.*Mobile|Windows Phone|BlackBerry|IEMobile|Opera Mini/i.test(ua);if(m)document.documentElement.classList.add('mc-mobile');})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
