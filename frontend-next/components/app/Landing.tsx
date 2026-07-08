import { MomCareApp } from './MomCareApp';
import { Villy } from '@/components/brand/Villy';

const GRADES = [
  { k: 'a', badge: 'A', title: '간호사 · 신생아 전문', role: '신생아실·산후조리원·신생아중환자실·산후병동', price: '50,000', tags: ['신생아실', '산후병동', 'NICU'] },
  { k: 'b', badge: 'B', title: '간호사 · 일반', role: '기타 병동 근무 경력 보유', price: '30,000', tags: ['간호사 면허', '병동 경력'] },
  { k: 'c', badge: 'C', title: '간호조무사 · 신생아', role: '신생아실·산후조리원 근무 경험', price: '30,000', tags: ['조무사 자격', '산후조리'] },
  { k: 'd', badge: 'D', title: '간호조무사 · 일반', role: '일반 경력 보유', price: '20,000', tags: ['조무사 자격', '일반 경력'] },
];

const SAFETY: [string, string, string][] = [
  ['🪪', '실명 인증', '본인·신분증 인증 완료자만 활동'],
  ['📍', 'GPS 출퇴근', '실시간 위치·근무 시각 자동 기록'],
  ['🚨', '응급신고 버튼', '긴급 상황 시 원터치 신고'],
  ['🛡️', '보험 가입', '돌봄 중 사고 대비 보장'],
  ['📹', 'CCTV 동의', '필요 시 녹화 동의 기능'],
  ['📞', '긴급 연락처', '보호자 긴급 연락망 등록'],
];

const PHASES = [
  { n: 1, tag: 'Phase 1 · 런칭', title: '신생아 전문 케어', age: '0~12개월 · 간호사·간호조무사', items: ['시간제·야간 돌봄', '수유·기저귀·목욕', '재우기·육아상담'] },
  { n: 2, tag: 'Phase 2 · 확장', title: '영유아 돌봄 서비스', age: '1~7세 · 보육교사·유치원 교사', items: ['놀이·책읽기·미술놀이', '한글·숫자놀이·식사보조', '어린이집 등·하원'] },
  { n: 3, tag: 'Phase 3 · 프리미엄', title: '전문 놀이 교육', age: '특기·발달 · 전문 교사·치료사', items: ['영어·오감·음악·미술놀이', '몬테소리·독서 활동', '언어·놀이치료 발달지원'] },
];

export function Landing() {
  return (
    <div className="mc-landing">
      {/* 내비게이션 */}
      <nav className="mc-nav">
        <a href="#top" className="mc-logo">
          <Villy size={34} /> 케어빌리지
        </a>
        <div className="mc-nav-links">
          <a href="#why">왜 케어빌리지</a>
          <a href="#grades">전문가 등급</a>
          <a href="#demo">앱 미리보기</a>
          <a href="#roadmap">확장 로드맵</a>
          <a href="#demo" className="mc-nav-cta">데모 체험</a>
        </div>
      </nav>

      {/* HERO */}
      <header className="mc-hero" id="top">
        <div>
          <span className="mc-hero-eyebrow"><span className="mc-dot" /> 대한민국 최초 · 성장 단계별 전문 돌봄 플랫폼</span>
          <h1>우리 아이를<br />믿고 맡길 수 있는<br /><em>전문 육아도우미</em></h1>
          <p className="mc-hero-sub">
            간호사·간호조무사 등 <b>검증된 의료 전문가</b>를 원하는 날짜와 시간에 매칭합니다.
            신생아도 안심하고 맡길 수 있는, 프리미엄 시간제 돌봄 서비스.
          </p>
          <div className="mc-hero-actions">
            <a href="#demo" className="mc-btn-primary">앱 데모 체험하기 →</a>
            <a href="#why" className="mc-btn-ghost">서비스 알아보기</a>
          </div>
          <div className="mc-hero-stats">
            <div className="mc-stat"><div className="mc-stat-num">100%</div><div className="mc-stat-label">자격증·신원 검증</div></div>
            <div className="mc-stat"><div className="mc-stat-num">A~D</div><div className="mc-stat-label">경력별 전문가 등급제</div></div>
            <div className="mc-stat"><div className="mc-stat-num">24/7</div><div className="mc-stat-label">야간·긴급 돌봄</div></div>
          </div>
        </div>
        <div className="mc-hero-visual">
          <div className="mc-hero-blob" />
          <Villy size={230} className="relative z-[2] drop-shadow-[0_20px_40px_rgba(62,93,79,0.25)]" />
          <div className="mc-float-card mc-float-1">
            <div className="mc-fc-ic" style={{ background: '#E9F0EC' }}>🩺</div>
            <div><div className="mc-fc-t">간호사 자격 인증</div><div className="mc-fc-s">면허증 검수 완료</div></div>
          </div>
          <div className="mc-float-card mc-float-2">
            <div className="mc-fc-ic" style={{ background: '#FCEFE9' }}>📍</div>
            <div><div className="mc-fc-t">실시간 위치 확인</div><div className="mc-fc-s">GPS 출퇴근 체크</div></div>
          </div>
          <div className="mc-float-card mc-float-3">
            <div className="mc-fc-ic" style={{ background: '#FBF1E0' }}>⭐</div>
            <div><div className="mc-fc-t">평점 4.9 / 5.0</div><div className="mc-fc-s">양방향 리뷰 시스템</div></div>
          </div>
        </div>
      </header>

      {/* 미션 */}
      <section className="mc-mission">
        <div className="mc-mission-inner">
          <div className="mc-mission-label">Our Mission · 서비스 철학</div>
          <h2>“한 아이를 키우는 데는 <b>온 마을</b>이 필요합니다.<br />우리는 그 마을을 <b>디지털로</b> 연결합니다.”</h2>
          <p>
            핵가족화와 맞벌이 증가로 사라진 공동체의 돌봄 문화. 케어빌리지는 검증된 전문 자격을 갖춘
            간호사·간호조무사·보육교사를 하나의 플랫폼으로 연결하여, 부모가 필요한 순간 언제든
            믿고 도움을 받을 수 있는 새로운 육아 생태계를 만듭니다.
          </p>
        </div>
      </section>

      {/* 차별화 */}
      <section className="mc-section" id="why">
        <div className="mc-sec-head">
          <span className="mc-sec-tag">Why MomCare</span>
          <h2>단순 베이비시터가 아닙니다.<br />의료 전문가가 돌봅니다.</h2>
          <p>자격 제한 없는 일반 매칭 앱과는 출발점이 다릅니다. 케어빌리지는 오직 검증된 전문 인력만 활동합니다.</p>
        </div>
        <div className="mc-compare">
          <div className="mc-compare-card mc-compare-bad">
            <h3>😟 일반 베이비시터 앱</h3>
            <ul>
              {['자격 제한 없이 누구나 가입 가능', '전문성 편차가 크고 검증 어려움', '신생아·응급 상황 대응 미흡', '신원·범죄경력 확인 불투명'].map((t) => (
                <li key={t}><span className="mc-check">✕</span> {t}</li>
              ))}
            </ul>
          </div>
          <div className="mc-compare-card mc-compare-good">
            <h3>🕊️ 케어빌리지</h3>
            <ul>
              {['간호사·간호조무사만 가입 가능', '면허증·자격증 인증 필수, 경력별 등급제', '신생아 전문 돌봄 · 의료 지식 보유', '범죄경력·아동학대 조회, 관리자 승인제'].map((t) => (
                <li key={t}><span className="mc-check">✓</span> {t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 등급 */}
      <section className="mc-section" id="grades" style={{ paddingTop: 0 }}>
        <div className="mc-sec-head">
          <span className="mc-sec-tag">Expert Grades</span>
          <h2>경력에 따라 나뉘는<br />4단계 전문가 등급제</h2>
          <p>부모가 원하는 전문성 수준을 직접 선택합니다. 시급은 등급별로 투명하게 공개됩니다.</p>
        </div>
        <div className="mc-grades">
          {GRADES.map((g) => (
            <div key={g.k} className={`mc-grade mc-grade-${g.k}`}>
              <div className="mc-grade-badge">{g.badge}</div>
              <h4>{g.title}</h4>
              <div className="mc-grade-role">{g.role}</div>
              <div className="mc-grade-price">{g.price}<small>원/시간</small></div>
              <div className="mc-grade-tags">{g.tags.map((t) => <span key={t}>{t}</span>)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 이용 흐름 */}
      <section className="mc-flow-strip">
        <div className="mc-section" style={{ maxWidth: 1200 }}>
          <div className="mc-sec-head">
            <span className="mc-sec-tag">How it works</span>
            <h2>3분이면 충분합니다</h2>
          </div>
          <div className="mc-steps">
            {[
              ['1', '예약하기', '날짜·시간·주소·아이 나이·원하는 전문가 등급을 선택하고 결제합니다.'],
              ['2', '자동 매칭', '해당 시간에 근무 가능한 검증된 전문가가 자동으로 매칭됩니다.'],
              ['3', '안심 돌봄', 'GPS 출퇴근 체크, 실시간 채팅, 육아일지로 근무 전 과정을 확인합니다.'],
            ].map(([n, t, d]) => (
              <div className="mc-step" key={n}>
                <div className="mc-step-n">{n}</div>
                <h4>{t}</h4>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 앱 데모 (React 앱 임베드) */}
      <section className="mc-demo mc-section" id="demo">
        <div className="mc-demo-wrap">
          <div className="mc-demo-copy">
            <span className="mc-sec-tag">Live Prototype</span>
            <h2 style={{ fontFamily: 'var(--mc-serif)', fontSize: 'clamp(28px,4vw,44px)', color: 'var(--mc-pine)', lineHeight: 1.15, letterSpacing: '-.025em', fontWeight: 700 }}>
              직접 눌러보는<br />앱 화면 흐름
            </h2>
            <p style={{ fontSize: 16, color: 'var(--mc-ink-2)', maxWidth: 380, margin: '18px 0', lineHeight: 1.7 }}>
              오른쪽 폰 화면에서 로그인 후 예약 → 매칭 → 실시간 근무 → 리뷰까지
              실제 사용 흐름을 체험해 보세요. 데모 계정으로 부모·근무자·관리자를 모두 볼 수 있습니다.
            </p>
            <div className="mc-demo-hint"><span className="mc-tap">👆</span> 폰 화면 안의 버튼이 모두 작동합니다</div>
          </div>
          <div className="mc-phone-stage">
            <div className="mc-phone">
              <div className="mc-screen">
                <MomCareApp />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 안전 */}
      <section className="mc-section" style={{ paddingTop: 0 }}>
        <div className="mc-sec-head">
          <span className="mc-sec-tag">Safety First</span>
          <h2>부모가 안심할 수 있는<br />6중 안전 장치</h2>
        </div>
        <div className="mc-safety">
          {SAFETY.map(([ic, t, d]) => (
            <div className="mc-safe-item" key={t}>
              <div className="mc-safe-ic">{ic}</div>
              <div><h4>{t}</h4><p>{d}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* 로드맵 */}
      <section className="mc-roadmap" id="roadmap">
        <div className="mc-section">
          <div className="mc-sec-head">
            <span className="mc-sec-tag">Growth Roadmap</span>
            <h2>신생아부터 초등까지,<br />성장 단계별 전문가로 확장</h2>
            <p>&quot;한 아이가 태어나는 순간부터 성장하는 모든 과정을 하나의 플랫폼으로 연결한다.&quot;</p>
          </div>
          <div className="mc-timeline">
            {PHASES.map((p) => (
              <div className={`mc-phase mc-phase-${p.n}`} key={p.n}>
                <span className="mc-phase-tag">{p.tag}</span>
                <h4>{p.title}</h4>
                <div className="mc-phase-age">{p.age}</div>
                <ul>{p.items.map((it) => <li key={it}>{it}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mc-cta-banner">
        <div className="mc-cta-inner">
          <h2>육아는 혼자 감당하는 일이 아닙니다.<br /><b>사회가 함께 책임지는 일</b>입니다.</h2>
          <p>케어빌리지와 함께 더 안전하고 따뜻한 돌봄 문화를 만들어갑니다.</p>
          <a href="#demo" className="mc-btn-primary">지금 앱 데모 체험하기 →</a>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="mc-footer">
        <div className="mc-footer-inner">
          <div>
            <div className="mc-logo"><Villy size={30} /> 케어빌리지</div>
            <p className="mc-footer-tag">의료 전문가 기반 프리미엄 육아 매칭 플랫폼. 검증된 전문가를 필요한 시간에 연결합니다.</p>
          </div>
          <div className="mc-footer-cols">
            <div className="mc-footer-col"><h5>서비스</h5><a href="#why">왜 케어빌리지</a><a href="#grades">전문가 등급</a><a href="#demo">앱 미리보기</a></div>
            <div className="mc-footer-col"><h5>회사</h5><a href="#">브랜드 철학</a><a href="#roadmap">확장 로드맵</a><a href="#">투자 문의</a></div>
            <div className="mc-footer-col"><h5>고객지원</h5><a href="#">이용안내</a><a href="#">자주 묻는 질문</a><a href="#">고객센터</a></div>
          </div>
        </div>
        <div className="mc-footer-bottom">
          <span>© 2026 케어빌리지(CareVillage). 투자유치용 프로토타입.</span>
          <span>“그 마을을, 디지털로 연결합니다.”</span>
        </div>
      </footer>
    </div>
  );
}
