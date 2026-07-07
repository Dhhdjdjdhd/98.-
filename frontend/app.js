/* ============================================================
   맘케어 프로토타입 — 앱 화면 라우터 (Mock)
   실제 백엔드 없이 클라이언트 상태로 화면 흐름을 시연
   ============================================================ */

// 예약 상태 (부모 플로우에서 누적)
const mcState = {
  role: 'parent',
  grade: null,      // {code, name, price}
  date: null,       // 숫자(일)
  time: null,       // 시작시간 문자열
  hours: 2,
  address: '',
  childAge: null,   // {label}
  rating: 0,
  reviewTags: [],
  bookingId: null,      // 실서버 예약 id (연동 시)
  matchedWorker: null,  // 실서버 매칭 근무자 (연동 시)
};

const GRADES = {
  A: { code: 'A', name: '간호사 · 신생아 전문', price: 50000, badge: 'var(--mc-terra)' },
  B: { code: 'B', name: '간호사 · 일반', price: 30000, badge: 'var(--mc-pine-soft)' },
  C: { code: 'C', name: '간호조무사 · 신생아', price: 30000, badge: 'var(--mc-amber)' },
  D: { code: 'D', name: '간호조무사 · 일반', price: 20000, badge: '#6E7B62' },
};

const won = (n) => n.toLocaleString('ko-KR') + '원';

// 아이 나이 enum ↔ 라벨
const CHILD_AGES = {
  NEWBORN: '신생아',
  INFANT: '영아',
  TODDLER: '돌 이후',
};

// ------------------------------------------------------------
// 화면 정의: 각 함수는 {body, foot} HTML을 반환
// ------------------------------------------------------------
const SCREENS = {

  /* ===== 인증 ===== */
  'login': () => ({
    body: `
      <div style="text-align:center;padding:22px 0 6px">
        <div style="font-size:44px">🤱</div>
        <h3 style="font-family:var(--mc-serif);font-size:24px;color:var(--mc-pine);margin-top:8px">맘케어 로그인</h3>
        <p style="font-size:13px;color:var(--mc-muted);margin-top:4px">검증된 전문가와 함께하세요</p>
      </div>
      <div class="mc-field"><label>휴대폰 번호</label><input id="mcLoginPhone" type="text" placeholder="010-1111-1111" value="010-1111-1111"></div>
      <div class="mc-field"><label>비밀번호</label><input id="mcLoginPw" type="password" placeholder="비밀번호" value="test1234"></div>
      <button class="mc-app-next" style="margin-top:4px" onclick="mcDoLogin()">로그인</button>
      <div style="text-align:center;margin:16px 0;font-size:13px;color:var(--mc-muted)">계정이 없으신가요? <a onclick="mcGo('signup-choice')" style="color:var(--mc-terra);font-weight:700;cursor:pointer">회원가입</a></div>
      <div style="display:flex;align-items:center;gap:10px;margin:16px 0"><div style="flex:1;height:1px;background:var(--mc-line)"></div><span style="font-size:12px;color:var(--mc-muted)">데모 계정으로 바로 체험</span><div style="flex:1;height:1px;background:var(--mc-line)"></div></div>
      <div class="mc-opts">
        <button class="mc-opt" onclick="mcQuickLogin('parent')"><span class="mc-opt-ic">👨‍👩‍👧</span><span class="mc-opt-t"><b>부모로 체험</b><span>예약·매칭·리뷰</span></span></button>
        <button class="mc-opt" onclick="mcQuickLogin('worker')"><span class="mc-opt-ic">🩺</span><span class="mc-opt-t"><b>근무자로 체험</b><span>예약요청·수입</span></span></button>
        <button class="mc-opt" onclick="mcQuickLogin('admin')"><span class="mc-opt-ic">🛡️</span><span class="mc-opt-t"><b>관리자로 체험</b><span>자격 승인</span></span></button>
      </div>`,
    foot: '',
  }),

  'signup-choice': () => ({
    body: `
      ${backBar('login', '회원가입')}
      <div class="mc-q">어떤 회원으로<br>가입하시나요?</div>
      <div class="mc-q-sub">부모 또는 돌봄 전문가를 선택하세요</div>
      <div class="mc-opts">
        <button class="mc-opt" onclick="mcGo('signup-parent')"><span class="mc-opt-ic">👨‍👩‍👧</span><span class="mc-opt-t"><b>부모 회원</b><span>돌봄을 받고 싶어요</span></span></button>
        <button class="mc-opt" onclick="mcGo('signup-worker')"><span class="mc-opt-ic">🩺</span><span class="mc-opt-t"><b>근무자 회원</b><span>간호사·간호조무사</span></span></button>
      </div>`,
    foot: '',
  }),

  'signup-parent': () => ({
    body: `
      ${backBar('signup-choice', '부모 회원가입')}
      <div class="mc-field"><label>이름</label><input id="mcSuName" placeholder="예) 지민맘"></div>
      <div class="mc-field"><label>휴대폰 번호</label><input id="mcSuPhone" placeholder="010-0000-0000"></div>
      <div class="mc-field"><label>비밀번호 (4자 이상)</label><input id="mcSuPw" type="password" placeholder="비밀번호"></div>
      <div class="mc-field"><label>주소</label><input id="mcSuAddr" placeholder="서울시 강남구 ..."></div>`,
    foot: `<button class="mc-app-next" onclick="mcDoSignupParent()">가입하고 시작하기</button>`,
  }),

  'signup-worker': () => ({
    body: `
      ${backBar('signup-choice', '근무자 회원가입')}
      <div class="mc-field"><label>이름</label><input id="mcSwName" placeholder="예) 김서연"></div>
      <div class="mc-field"><label>휴대폰 번호</label><input id="mcSwPhone" placeholder="010-0000-0000"></div>
      <div class="mc-field"><label>비밀번호 (4자 이상)</label><input id="mcSwPw" type="password" placeholder="비밀번호"></div>
      <div class="mc-app-label">자격</div>
      <div class="mc-opts" id="mcSwLicense">
        <button class="mc-opt mc-sel" onclick="mcPickLicense(this,'간호사')"><span class="mc-opt-ic">🩺</span><span class="mc-opt-t"><b>간호사</b></span></button>
        <button class="mc-opt" onclick="mcPickLicense(this,'간호조무사')"><span class="mc-opt-ic">💉</span><span class="mc-opt-t"><b>간호조무사</b></span></button>
      </div>
      <div class="mc-field" style="margin-top:14px"><label>희망 등급 (A/B/C/D)</label><input id="mcSwGrade" placeholder="B" value="B"></div>
      <div class="mc-field"><label>경력 (년)</label><input id="mcSwYears" type="number" placeholder="3" value="3"></div>
      <div class="mc-field"><label>경력 요약</label><input id="mcSwNote" placeholder="예) 신생아실 3년"></div>
      <div class="mc-app-label">서류 첨부 (이미지)</div>
      <div class="mc-field"><label>면허/자격증</label><input type="file" accept="image/*" id="mcSwFileLicense" style="font-size:13px;padding:10px"></div>
      <div class="mc-field"><label>신분증</label><input type="file" accept="image/*" id="mcSwFileId" style="font-size:13px;padding:10px"></div>`,
    foot: `<button class="mc-app-next" onclick="mcDoSignupWorker()">가입 신청 (승인 대기)</button>`,
  }),

  /* ===== 부모 ===== */
  'parent-home': () => ({
    body: `
      <div class="mc-app-top" style="justify-content:space-between">
        <div><div class="mc-app-greet">안녕하세요, ${mcApi.user?.name || '고객'}님 👋<b>오늘도 안심하세요</b></div></div>
        <button class="mc-back" style="border:none;background:var(--mc-ivory-2)" onclick="mcLogout()" title="로그아웃">🚪</button>
      </div>
      <div class="mc-hero-cta" onclick="mcGo('parent-grade')">
        <h4>전문 육아도우미 예약</h4>
        <p>검증된 간호사·간호조무사를 원하는 시간에</p>
        <span class="mc-go">예약 시작하기 →</span>
        <span class="mc-cta-emoji">🤱</span>
      </div>
      <button class="mc-opt" style="margin-bottom:4px" onclick="mcGo('parent-bookings')">
        <span class="mc-opt-ic">📋</span>
        <span class="mc-opt-t"><b>내 예약내역</b><span>지난 예약 보기 · 재예약</span></span>
        <span style="color:var(--mc-muted)">›</span>
      </button>
      <div class="mc-app-label">⭐ 즐겨찾기 전문가</div>
      <div id="mcParentFavs"><div style="font-size:13px;color:var(--mc-muted);padding:6px 2px">불러오는 중…</div></div>
      <div class="mc-app-label">최근 예약</div>
      <div id="mcParentRecent"><div style="font-size:13px;color:var(--mc-muted);padding:6px 2px">불러오는 중…</div></div>
      <div class="mc-app-label">전문가 등급 안내</div>
      <div class="mc-mini-grades">
        ${['A','B','C','D'].map(g => `
          <div class="mc-mini-grade">
            <div class="mc-mg-badge" style="background:${GRADES[g].badge}">${g}</div>
            <div class="mc-mg-info"><b>${GRADES[g].name}</b><span>시간제 전문 돌봄</span></div>
            <div class="mc-mg-price">${(GRADES[g].price/10000)}만원<span style="font-size:11px;color:var(--mc-muted)">/시</span></div>
          </div>`).join('')}
      </div>`,
    foot: `<button class="mc-app-next" onclick="mcGo('parent-grade')">예약하기</button>`,
    onEnter: () => mcLoadParentHome(),
  }),

  'parent-bookings': () => ({
    body: `
      ${backBar('parent-home', '내 예약내역')}
      <div id="mcBookingList"><div style="text-align:center;padding:20px;color:var(--mc-muted);font-size:14px">불러오는 중…</div></div>`,
    foot: '',
    onEnter: () => mcLoadBookings(),
  }),

  'parent-grade': () => ({
    body: `
      ${backBar('parent-home', '전문가 등급 선택')}
      ${progress(1)}
      <div class="mc-q">어떤 전문가를<br>원하시나요?</div>
      <div class="mc-q-sub">아이 상태와 필요에 맞는 등급을 선택하세요</div>
      <div class="mc-opts">
        ${['A','B','C','D'].map(g => `
          <button class="mc-opt ${mcState.grade?.code===g?'mc-sel':''}" onclick="mcPick('grade','${g}')">
            <span class="mc-opt-ic" style="width:38px;height:38px;border-radius:11px;background:${GRADES[g].badge};color:#fff;display:grid;place-items:center;font-family:var(--mc-serif);font-weight:700">${g}</span>
            <span class="mc-opt-t"><b>${GRADES[g].name}</b><span>${g==='A'?'신생아실·산후병동 경력':g==='B'?'병동 근무 간호사':g==='C'?'신생아·산후조리 경험':'일반 경력 조무사'}</span></span>
            <span class="mc-opt-price">${won(GRADES[g].price)}/시</span>
          </button>`).join('')}
      </div>`,
    foot: nextBtn('parent-date', !!mcState.grade),
  }),

  'parent-date': () => ({
    body: `
      ${backBar('parent-grade', '날짜 선택')}
      ${progress(2)}
      <div class="mc-q">언제 도움이<br>필요하신가요?</div>
      <div class="mc-q-sub">2026년 7월 · 근무 가능한 날짜만 표시됩니다</div>
      ${calendar()}`,
    foot: nextBtn('parent-time', !!mcState.date),
  }),

  'parent-time': () => ({
    body: `
      ${backBar('parent-date', '시간 선택')}
      ${progress(3)}
      <div class="mc-q">몇 시부터<br>몇 시간 필요하세요?</div>
      <div class="mc-q-sub">7월 ${mcState.date}일 · 시작 시간을 선택하세요</div>
      <div class="mc-app-label">시작 시간</div>
      <div class="mc-slots">
        ${['09:00','11:00','13:00','15:00','18:00','21:00'].map(t=>`
          <button class="mc-slot ${mcState.time===t?'mc-sel':''}" onclick="mcPick('time','${t}')">${t}</button>`).join('')}
      </div>
      <div class="mc-app-label">이용 시간</div>
      <div class="mc-slots">
        ${[2,3,4,6].map(h=>`
          <button class="mc-slot ${mcState.hours===h?'mc-sel':''}" onclick="mcPick('hours','${h}')">${h}시간</button>`).join('')}
      </div>`,
    foot: nextBtn('parent-address', !!mcState.time),
  }),

  'parent-address': () => ({
    body: `
      ${backBar('parent-time', '주소 · 아이 정보')}
      ${progress(4)}
      <div class="mc-q">어디로,<br>누구를 돌볼까요?</div>
      <div class="mc-q-sub">방문 주소와 아이 나이를 알려주세요</div>
      <div class="mc-field">
        <label>돌봄 장소</label>
        <input type="text" id="mcAddr" placeholder="예) 서울시 강남구 테헤란로 123" value="${mcState.address}" oninput="mcState.address=this.value;mcRefreshFoot('parent-child')">
      </div>
      <div class="mc-app-label">아이 나이</div>
      <div class="mc-opts">
        ${[['👶','신생아','100일 미만','NEWBORN'],['🍼','영아','6개월','INFANT'],['🧸','돌 이후','12개월+','TODDLER']].map(([ic,l,s,v])=>`
          <button class="mc-opt ${mcState.childAge?.value===v?'mc-sel':''}" onclick="mcPick('childAge','${v}')">
            <span class="mc-opt-ic">${ic}</span>
            <span class="mc-opt-t"><b>${l}</b><span>${s}</span></span>
          </button>`).join('')}
      </div>`,
    foot: nextBtn('parent-pay', !!(mcState.address && mcState.childAge)),
  }),

  'parent-pay': () => {
    const base = mcState.grade.price * mcState.hours;
    const fee = Math.round(base * 0.15);
    const total = base + fee;
    return {
      body: `
        ${backBar('parent-address', '결제')}
        ${progress(5)}
        <div class="mc-q">예약 내용을<br>확인해 주세요</div>
        <div class="mc-q-sub">결제 후 전문가가 자동 매칭됩니다</div>
        <div class="mc-receipt">
          <div class="mc-receipt-row"><span>전문가 등급</span><b>${mcState.grade.code}등급 · ${mcState.grade.name}</b></div>
          <div class="mc-receipt-row"><span>일정</span><b>7월 ${mcState.date}일 ${mcState.time}~ · ${mcState.hours}시간</b></div>
          <div class="mc-receipt-row"><span>아이</span><b>${mcState.childAge.label}</b></div>
          <div class="mc-receipt-row"><span>장소</span><b style="font-size:12px">${mcState.address}</b></div>
        </div>
        <div class="mc-receipt">
          <div class="mc-receipt-row"><span>시급 ${won(mcState.grade.price)} × ${mcState.hours}시간</span><b>${won(base)}</b></div>
          <div class="mc-receipt-row"><span>플랫폼 수수료 (15%)</span><b>${won(fee)}</b></div>
          <div class="mc-receipt-total"><span>총 결제금액</span><b>${won(total)}</b></div>
        </div>
        <div class="mc-app-label">결제 수단</div>
        <div class="mc-opt mc-sel"><span class="mc-opt-ic">💳</span><span class="mc-opt-t"><b>신한카드 ****1234</b><span>등록된 기본 카드</span></span></div>`,
      foot: `<button class="mc-app-next" onclick="mcGo('parent-matching')">${won(total)} 결제하고 매칭</button>`,
    };
  },

  'parent-matching': () => ({
    body: `
      <div class="mc-done-wrap" style="padding-top:80px">
        <div style="width:96px;height:96px;margin:0 auto 24px;border-radius:50%;border:4px solid var(--mc-line);border-top-color:var(--mc-terra);animation:mc-spin 1s linear infinite"></div>
        <h3>전문가를 찾고 있어요</h3>
        <p>7월 ${mcState.date}일 근무 가능한<br>${mcState.grade.code}등급 전문가를 매칭 중입니다…</p>
      </div>
      <style>@keyframes mc-spin{to{transform:rotate(360deg)}}</style>`,
    foot: '',
    onEnter: () => mcRunMatching(),
  }),

  'parent-matched': () => {
    // 실서버 매칭 결과가 있으면 그 데이터로, 없으면 데모용 기본값
    const w = mcState.matchedWorker;
    const name = w ? w.name : '김서연';
    const roleTxt = w ? w.profile.licenseType : '간호사';
    const career = w ? (w.profile.careerNote || `${w.profile.careerYears}년 경력`) : '신생아실 7년 경력';
    const rating = w ? w.profile.ratingAvg : 4.9;
    const care = w ? w.profile.careCount : 328;
    const years = w ? w.profile.careerYears : 7;
    return {
    body: `
      <div style="text-align:center;margin:10px 0 18px">
        <span style="background:#E9F0EC;color:var(--mc-pine);padding:6px 14px;border-radius:100px;font-size:13px;font-weight:700">✓ 매칭 완료${mcApi.live ? ' · 실서버' : ''}</span>
      </div>
      <div class="mc-worker-card">
        <div class="mc-worker-ava">👩‍⚕️</div>
        <h4>${name} ${roleTxt}</h4>
        <div class="mc-worker-role">${mcState.grade.code}등급 · ${career}</div>
        <div class="mc-verify-badges">
          <span class="mc-vbadge">✓ 면허 인증</span>
          <span class="mc-vbadge">✓ 범죄경력 조회</span>
          <span class="mc-vbadge">✓ 아동학대 조회</span>
          <span class="mc-vbadge">✓ 보건증</span>
        </div>
        <div class="mc-worker-stats">
          <div class="mc-ws"><b>${rating}</b><span>평점</span></div>
          <div class="mc-ws"><b>${care}</b><span>돌봄 횟수</span></div>
          <div class="mc-ws"><b>${years}년</b><span>경력</span></div>
        </div>
      </div>
      <div class="mc-live-actions">
        <button class="mc-live-btn" onclick="alert('채팅 화면으로 이동합니다 (프로토타입)')">💬 채팅</button>
        <button class="mc-live-btn" onclick="alert('전화 연결 (프로토타입)')">📞 전화</button>
      </div>`,
    foot: `<button class="mc-app-next" onclick="mcGo('parent-active')">근무 시작 화면 보기 →</button>`,
    };
  },

  'parent-active': () => ({
    body: `
      ${backBar('parent-matched', '실시간 근무')}
      <div class="mc-map">
        <div class="mc-map-grid"></div>
        <div class="mc-map-route"></div>
        <div class="mc-map-pin mc-pin-home">🏠</div>
        <div class="mc-map-pin mc-pin-worker">👩‍⚕️</div>
        <div class="mc-eta">도착까지 8분 · 이동중</div>
      </div>
      <div class="mc-live-actions">
        <button class="mc-live-btn" onclick="alert('채팅 (프로토타입)')">💬 채팅하기</button>
        <button class="mc-live-btn mc-emergency" onclick="alert('🚨 응급신고가 접수되었습니다 (프로토타입)')">🚨 응급신고</button>
      </div>
      <div class="mc-app-label">실시간 육아일지</div>
      <div class="mc-timeline-log">
        <div class="mc-log-item"><span class="mc-log-time">${mcState.time}</span><span class="mc-log-txt">✅ GPS 출근 체크 완료</span></div>
        <div class="mc-log-item"><span class="mc-log-time">+20분</span><span class="mc-log-txt">🍼 분유 120ml 수유 완료</span></div>
        <div class="mc-log-item"><span class="mc-log-time">+45분</span><span class="mc-log-txt">💤 트림 후 재우기 성공</span></div>
        <div class="mc-log-item"><span class="mc-log-time">+70분</span><span class="mc-log-txt">🧷 기저귀 교환</span></div>
      </div>`,
    foot: `<button class="mc-app-next" onclick="mcGo('parent-review')">근무 종료 · 리뷰 남기기</button>`,
    onEnter: () => { if (mcApi.live && mcState.bookingId) mcApi.checkIn(mcState.bookingId).catch(() => {}); },
  }),

  'parent-review': () => ({
    body: `
      ${backBar('parent-active', '리뷰 작성')}
      <div class="mc-worker-card" style="padding:20px">
        <div class="mc-worker-ava" style="width:64px;height:64px;font-size:30px">👩‍⚕️</div>
        <h4 style="font-size:17px">김서연 간호사와의<br>돌봄은 어떠셨나요?</h4>
      </div>
      <div class="mc-stars" id="mcStars">
        ${[1,2,3,4,5].map(n=>`<span data-n="${n}" onclick="mcRate(${n})">★</span>`).join('')}
      </div>
      <div class="mc-app-label" style="text-align:center">좋았던 점을 골라주세요</div>
      <div class="mc-review-tags">
        ${['친절해요','전문성 최고','시간 준수','꼼꼼한 케어','아이가 좋아함','또 만나고 싶어요'].map(t=>`
          <button class="mc-rtag" onclick="mcToggleTag(this,'${t}')">${t}</button>`).join('')}
      </div>`,
    foot: `<button class="mc-app-next" onclick="mcSubmitReview()">리뷰 등록하기</button>`,
  }),

  'parent-done': () => ({
    body: `
      <div class="mc-done-wrap">
        <div class="mc-done-check">✓</div>
        <h3>돌봄이 완료되었어요!</h3>
        <p>소중한 리뷰가 등록되었습니다.<br>김서연 간호사님을 즐겨찾기에 추가할까요?</p>
        <button class="mc-btn-ghost" style="font-size:14px;padding:12px 22px" onclick="mcAddFavorite()">⭐ 즐겨찾기 추가</button>
      </div>`,
    foot: `<button class="mc-app-next" onclick="mcResetAndHome()">처음으로 돌아가기</button>`,
  }),

  /* ===== 근무자 ===== */
  'worker-home': () => ({
    body: `
      <div class="mc-app-top" style="justify-content:space-between">
        <div><div class="mc-app-greet">${mcApi.user?.name || '근무자'}님 👩‍⚕️<b>오늘도 안전 근무!</b></div></div>
        <div style="display:flex;gap:8px;align-items:center">
          <span class="mc-vbadge" id="mcWkGrade">활동중</span>
          <button class="mc-back" style="border:none;background:var(--mc-ivory-2)" onclick="mcLogout()" title="로그아웃">🚪</button>
        </div>
      </div>
      <div class="mc-earn-card">
        <div class="mc-earn-label">누적 정산 수입</div>
        <div class="mc-earn-amt" id="mcWkEarn">—</div>
        <div class="mc-earn-row"><span id="mcWkCount">완료 근무 —건</span><span id="mcWkRating">평점 ⭐ —</span></div>
      </div>
      <div class="mc-app-label">내 배정 근무</div>
      <div id="mcWorkerList"><div style="text-align:center;padding:20px;color:var(--mc-muted);font-size:14px">불러오는 중…</div></div>`,
    foot: '',
    onEnter: () => mcLoadWorker(),
  }),

  'worker-accepted': () => ({
    body: `
      <div class="mc-done-wrap">
        <div class="mc-done-check">✓</div>
        <h3>예약을 수락했어요!</h3>
        <p>7월 12일 09:00 근무가 확정되었습니다.<br>일정과 길찾기는 '내 일정'에서 확인하세요.</p>
      </div>
      <div class="mc-app-label">근무 준비 체크리스트</div>
      <div class="mc-timeline-log">
        <div class="mc-log-item"><span class="mc-log-time">📍</span><span class="mc-log-txt">주소 확인 · 길찾기 안내</span></div>
        <div class="mc-log-item"><span class="mc-log-time">💬</span><span class="mc-log-txt">부모님과 사전 채팅</span></div>
        <div class="mc-log-item"><span class="mc-log-time">✅</span><span class="mc-log-txt">근무 시작 시 GPS 출근 체크</span></div>
      </div>`,
    foot: `<button class="mc-app-next" onclick="mcGo('worker-home')">홈으로</button>`,
  }),

  /* ===== 관리자 ===== */
  'admin-home': () => ({
    body: `
      <div class="mc-app-top" style="justify-content:space-between">
        <h3 style="font-size:20px">🛡️ 관리자 콘솔</h3>
        <button class="mc-back" style="border:none;background:var(--mc-ivory-2)" onclick="mcLogout()" title="로그아웃">🚪</button>
      </div>
      <div class="mc-admin-stat-row">
        <div class="mc-admin-stat"><b id="mcAdmPending">7</b><span>승인 대기</span></div>
        <div class="mc-admin-stat"><b id="mcAdmApproved">142</b><span>활동 전문가</span></div>
        <div class="mc-admin-stat"><b id="mcAdmBookings">2</b><span>예약 총계</span></div>
      </div>
      <div class="mc-app-label">자격 검수 대기</div>
      <div id="mcAdminList">
      <div class="mc-approve-card">
        <div class="mc-approve-top">
          <div class="mc-approve-ava">👩‍⚕️</div>
          <div><b>이하나</b><span>간호사 · A등급 신청</span></div>
        </div>
        <div class="mc-doc-chips">
          <span class="mc-doc-chip">✓ 간호사 면허증</span>
          <span class="mc-doc-chip">✓ 경력증명서</span>
          <span class="mc-doc-chip">✓ 신분증</span>
          <span class="mc-doc-chip mc-pending">⏳ 범죄경력 조회중</span>
        </div>
        <div class="mc-approve-actions">
          <button class="mc-btn-reject" onclick="alert('반려 사유 입력 (프로토타입)')">반려</button>
          <button class="mc-btn-approve" onclick="mcAdminApprove(this)">승인</button>
        </div>
      </div>
      <div class="mc-approve-card">
        <div class="mc-approve-top">
          <div class="mc-approve-ava">🧑‍⚕️</div>
          <div><b>박지우</b><span>간호조무사 · C등급 신청</span></div>
        </div>
        <div class="mc-doc-chips">
          <span class="mc-doc-chip">✓ 자격증</span>
          <span class="mc-doc-chip">✓ 산후조리원 경력</span>
          <span class="mc-doc-chip">✓ 보건증</span>
          <span class="mc-doc-chip">✓ 아동학대 조회</span>
        </div>
        <div class="mc-approve-actions">
          <button class="mc-btn-reject" onclick="alert('반려 사유 입력 (프로토타입)')">반려</button>
          <button class="mc-btn-approve" onclick="mcAdminApprove(this)">승인</button>
        </div>
      </div>
      </div>`,
    foot: '',
    onEnter: () => mcLoadAdmin(),
  }),
};

// ------------------------------------------------------------
// 공통 조각 헬퍼
// ------------------------------------------------------------
function backBar(to, title) {
  return `<div class="mc-app-top"><button class="mc-back" onclick="mcGo('${to}')">←</button><h3>${title}</h3></div>`;
}
function progress(step) {
  return `<div class="mc-progress">${[1,2,3,4,5].map(i=>`<span class="${i<=step?'mc-on':''}"></span>`).join('')}</div>`;
}
function nextBtn(to, enabled) {
  return `<button class="mc-app-next" ${enabled?'':'disabled'} onclick="mcGo('${to}')">다음</button>`;
}
function calendar() {
  // 7월 1일이 수요일이라고 가정 (프로토타입용 고정)
  const firstDow = 3; // 0=일
  const days = 31;
  let cells = '';
  ['일','월','화','수','목','금','토'].forEach(d => cells += `<div class="mc-dow">${d}</div>`);
  for (let i=0;i<firstDow;i++) cells += `<div></div>`;
  for (let d=1; d<=days; d++) {
    const past = d < 7; // 오늘(7일) 이전은 비활성
    const cls = past ? 'mc-off' : (mcState.date===d ? 'mc-sel' : 'mc-avail');
    const onclick = past ? '' : `onclick="mcPick('date','${d}')"`;
    cells += `<div class="mc-cal-day ${cls}" ${onclick}>${d}</div>`;
  }
  return `<div class="mc-cal"><div class="mc-cal-head"><span>‹</span><span>2026년 7월</span><span>›</span></div><div class="mc-cal-grid">${cells}</div></div>`;
}

// ------------------------------------------------------------
// 라우팅 & 상호작용
// ------------------------------------------------------------
let mcCurrent = 'parent-home';

function mcRender(screenId) {
  const s = SCREENS[screenId];
  if (!s) return;
  mcCurrent = screenId;
  const { body, foot, onEnter } = s();
  const bodyEl = document.getElementById('mcAppBody');
  const footEl = document.getElementById('mcAppFoot');
  bodyEl.innerHTML = `<div class="mc-view mc-view-active">${body}</div>`;
  bodyEl.scrollTop = 0;
  if (foot) { footEl.style.display = 'block'; footEl.innerHTML = foot; }
  else { footEl.style.display = 'none'; footEl.innerHTML = ''; }
  if (onEnter) onEnter();
}

function mcGo(screenId) { mcRender(screenId); }

// 선택값 저장 후 현재 화면 재렌더 (선택 하이라이트 + 다음버튼 활성)
function mcPick(key, val) {
  if (key === 'grade') mcState.grade = GRADES[val];
  else if (key === 'date') mcState.date = parseInt(val);
  else if (key === 'time') mcState.time = val;
  else if (key === 'hours') mcState.hours = parseInt(val);
  else if (key === 'childAge') mcState.childAge = { value: val, label: CHILD_AGES[val] };
  mcRender(mcCurrent);
}

// 주소 입력 중 foot 버튼만 갱신 (재렌더 시 포커스 유지 위해)
function mcRefreshFoot(to) {
  const ok = !!(mcState.address && mcState.childAge);
  document.getElementById('mcAppFoot').innerHTML = nextBtn(to, ok);
}

function mcRate(n) {
  mcState.rating = n;
  document.querySelectorAll('#mcStars span').forEach(sp => {
    sp.classList.toggle('mc-lit', parseInt(sp.dataset.n) <= n);
  });
}
function mcToggleTag(el, tag) {
  el.classList.toggle('mc-sel');
  const i = mcState.reviewTags.indexOf(tag);
  if (i>=0) mcState.reviewTags.splice(i,1); else mcState.reviewTags.push(tag);
}

// 관리자 화면: 실서버의 승인 대기 목록 + 통계 로드
async function mcLoadAdmin() {
  if (!mcApi.live) return; // 데모 모드는 정적 카드 유지
  try {
    const [pending, sum] = await Promise.all([
      mcApi.listWorkers('PENDING'),
      mcApi.summary(),
    ]);
    const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setTxt('mcAdmPending', sum.pending);
    setTxt('mcAdmApproved', sum.approved);
    setTxt('mcAdmBookings', sum.totalBookings);

    const list = document.getElementById('mcAdminList');
    if (!list) return;
    if (!pending.length) {
      list.innerHTML = `<div style="text-align:center;padding:24px;color:var(--mc-muted);font-size:14px">승인 대기 중인 근무자가 없습니다 ✓</div>`;
      return;
    }
    list.innerHTML = pending.map(mcAdminCardHtml).join('');
    mcLoadThumbs();
  } catch (e) {
    console.warn('관리자 데이터 로드 실패:', e);
  }
}

// 검수 카드의 서류 썸네일 로드 (파일 조회 → img src 설정)
function mcLoadThumbs() {
  document.querySelectorAll('.mc-doc-thumb').forEach(async (img) => {
    if (img.dataset.loaded) return;
    img.dataset.loaded = '1';
    try {
      const f = await mcApi.getFile(img.dataset.fid);
      img.src = f.dataUrl;
    } catch (e) { console.warn('썸네일 로드 실패:', e); }
  });
}

// 서류 이미지 크게 보기 (오버레이)
async function mcViewFile(fid) {
  try {
    const f = await mcApi.getFile(fid);
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:99999;display:grid;place-items:center;padding:24px;cursor:zoom-out';
    ov.innerHTML = `<img src="${f.dataUrl}" style="max-width:92%;max-height:92%;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.5)">`;
    ov.onclick = () => ov.remove();
    document.body.appendChild(ov);
  } catch (e) { alert('이미지 로드 실패: ' + e.message); }
}

// 실서버 근무자 → 검수 카드 HTML
function mcAdminCardHtml(w) {
  const d = w.docs || {};
  const chip = (ok, label) => `<span class="mc-doc-chip ${ok ? '' : 'mc-pending'}">${ok ? '✓' : '⏳'} ${label}</span>`;
  return `
    <div class="mc-approve-card" data-uid="${w.userId}">
      <div class="mc-approve-top">
        <div class="mc-approve-ava">👩‍⚕️</div>
        <div><b>${w.name || '이름미상'}</b><span>${w.licenseType} · ${w.grade}등급 신청 · ${w.careerNote || w.careerYears + '년'}</span></div>
      </div>
      <div class="mc-doc-chips">
        ${chip(d.license, '면허/자격증')}
        ${chip(d.career, '경력증명')}
        ${chip(d.idCard, '신분증')}
        ${chip(d.criminalCheck, '범죄경력')}
        ${chip(d.childAbuseCheck, '아동학대')}
        ${chip(d.healthCert, '보건증')}
      </div>
      ${w.docFiles && Object.keys(w.docFiles).length ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        ${Object.entries(w.docFiles).map(([kind, fid]) => `<img class="mc-doc-thumb" data-fid="${fid}" title="${kind}" style="width:52px;height:52px;object-fit:cover;border-radius:8px;border:1px solid var(--mc-line);cursor:pointer;background:var(--mc-ivory-2)" onclick="mcViewFile('${fid}')">`).join('')}
      </div>` : ''}
      <div class="mc-approve-actions">
        <button class="mc-btn-reject" onclick="mcRejectLive('${w.userId}', this)">반려</button>
        <button class="mc-btn-approve" onclick="mcApproveLive('${w.userId}', this)">승인</button>
      </div>
    </div>`;
}

// 실서버 승인/반려
async function mcApproveLive(userId, btn) {
  try { await mcApi.approveWorker(userId); } catch (e) { alert('승인 실패: ' + e.message); return; }
  mcRemoveAdminCard(btn, '✓ 승인 완료 — 활동 가능');
  mcRefreshAdminStats();
}
async function mcRejectLive(userId, btn) {
  try { await mcApi.rejectWorker(userId, '서류 미비'); } catch (e) { alert('반려 실패: ' + e.message); return; }
  mcRemoveAdminCard(btn, '반려 처리됨');
  mcRefreshAdminStats();
}
function mcRemoveAdminCard(btn, msg) {
  const card = btn.closest('.mc-approve-card');
  card.style.transition = 'opacity .4s, transform .4s';
  card.style.opacity = '0'; card.style.transform = 'translateX(30px)';
  setTimeout(() => {
    card.innerHTML = `<div style="text-align:center;padding:14px;color:var(--mc-pine);font-weight:700">${msg}</div>`;
    card.style.opacity = '1'; card.style.transform = 'none';
  }, 400);
}
async function mcRefreshAdminStats() {
  try {
    const sum = await mcApi.summary();
    const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setTxt('mcAdmPending', sum.pending);
    setTxt('mcAdmApproved', sum.approved);
    setTxt('mcAdmBookings', sum.totalBookings);
  } catch {}
}

function mcAdminApprove(btn) {
  const card = btn.closest('.mc-approve-card');
  card.style.transition = 'opacity .4s, transform .4s';
  card.style.opacity = '0';
  card.style.transform = 'translateX(30px)';
  setTimeout(() => { card.innerHTML = '<div style="text-align:center;padding:14px;color:var(--mc-pine);font-weight:700">✓ 승인 완료 — 활동 가능</div>'; card.style.opacity='1'; card.style.transform='none'; }, 400);
}

// ------------------------------------------------------------
// 근무자 앱 (실서버 연동)
// ------------------------------------------------------------
const mcSetText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

async function mcLoadWorker() {
  const uid = mcApi.user?.id;
  const listEl = document.getElementById('mcWorkerList');
  // 오프라인/데모 모드: 목업 표시
  if (!mcApi.live || !uid) {
    mcSetText('mcWkEarn', '1,840,000원');
    mcSetText('mcWkCount', '완료 근무 12건');
    mcSetText('mcWkRating', '평점 ⭐ 4.9');
    mcSetText('mcWkGrade', 'A등급 · 활동중');
    if (listEl) listEl.innerHTML = mcWorkerMockCards();
    return;
  }
  try {
    const [settle, detail, bookings] = await Promise.all([
      mcApi.settlement(uid),
      mcApi.getWorker(uid),
      mcApi.listBookings({ workerId: uid }),
    ]);
    mcSetText('mcWkEarn', won(settle.totalPayout));
    mcSetText('mcWkCount', `완료 근무 ${settle.completedCount}건`);
    mcSetText('mcWkRating', `평점 ⭐ ${detail.profile?.ratingAvg ?? '-'}`);
    mcSetText('mcWkGrade', `${detail.profile?.grade ?? ''}등급 · 활동중`);

    const active = bookings.filter((b) => b.status !== 'CANCELED').reverse();
    if (listEl) {
      listEl.innerHTML = active.length
        ? active.map(mcWorkerCardHtml).join('')
        : `<div style="text-align:center;padding:20px;color:var(--mc-muted);font-size:14px">아직 배정된 근무가 없습니다</div>`;
    }
  } catch (e) {
    console.warn('근무자 데이터 로드 실패:', e);
    if (listEl) listEl.innerHTML = `<div style="text-align:center;padding:20px;color:var(--mc-muted);font-size:14px">불러오기 실패</div>`;
  }
}

// 배정 근무 카드 (상태별 액션: 근무 시작 / 완료)
function mcWorkerCardHtml(b) {
  const hourly = GRADES[b.grade]?.price || 0;
  const payout = Math.round(hourly * b.hours * 0.85);
  const st = {
    MATCHED: ['배정됨', '#FCEFE9', 'var(--mc-terra-2)'],
    IN_PROGRESS: ['근무중', '#E9F0EC', 'var(--mc-pine)'],
    DONE: ['완료', '#EEF2F6', '#5A6B7B'],
  }[b.status] || [b.status, '#eee', '#888'];
  let action = '';
  if (b.status === 'MATCHED')
    action = `<button class="mc-rq-accept" style="width:100%;margin-top:10px" onclick="mcWorkerCheckIn('${b.id}', this)">근무 시작 (GPS 출근)</button>`;
  else if (b.status === 'IN_PROGRESS')
    action = `<button class="mc-rq-accept" style="width:100%;margin-top:10px;background:var(--mc-pine)" onclick="mcWorkerComplete('${b.id}', this)">근무 완료</button>`;
  return `
    <div class="mc-request-card" data-bid="${b.id}">
      <div class="mc-rq-top">
        <div><h4>${CHILD_AGES[b.childAge] || '아이'} 돌봄</h4><div class="mc-rq-meta">${b.date} ${b.startTime} · ${b.hours}시간 · ${b.grade}등급</div></div>
        <span class="mc-rq-badge" style="background:${st[1]};color:${st[2]}">${st[0]}</span>
      </div>
      <div class="mc-rq-meta">📍 ${b.address}</div>
      <div style="margin-top:6px" class="mc-rq-pay">정산 예정 ${won(payout)}</div>
      ${action}
    </div>`;
}

async function mcWorkerCheckIn(bid, btn) {
  btn.disabled = true; btn.textContent = '처리 중…';
  try { await mcApi.checkIn(bid); await mcLoadWorker(); }
  catch (e) { alert('근무 시작 실패: ' + e.message); btn.disabled = false; btn.textContent = '근무 시작 (GPS 출근)'; }
}
async function mcWorkerComplete(bid, btn) {
  btn.disabled = true; btn.textContent = '처리 중…';
  try { await mcApi.complete(bid); await mcLoadWorker(); }
  catch (e) { alert('근무 완료 실패: ' + e.message); btn.disabled = false; btn.textContent = '근무 완료'; }
}

// 오프라인 데모용 목업 카드
function mcWorkerMockCards() {
  return `
    <div class="mc-request-card">
      <div class="mc-rq-top"><div><h4>신생아 돌봄</h4><div class="mc-rq-meta">2026-07-12 09:00 · 3시간 · A등급</div></div><span class="mc-rq-badge">배정됨</span></div>
      <div class="mc-rq-meta">📍 서울시 강남구</div>
      <div style="margin-top:6px" class="mc-rq-pay">정산 예정 127,500원</div>
    </div>`;
}

function mcResetAndHome() {
  mcState.grade=null; mcState.date=null; mcState.time=null; mcState.hours=2;
  mcState.address=''; mcState.childAge=null; mcState.rating=0; mcState.reviewTags=[];
  mcState.bookingId=null; mcState.matchedWorker=null;
  mcRender('parent-home');
}

// 결제 → 예약생성 → 자동매칭 (실서버 연동, 실패 시 데모 폴백)
async function mcRunMatching() {
  if (mcApi.live) {
    try {
      const created = await mcApi.createBooking(mcApi.buildBookingPayload(mcState));
      mcState.bookingId = created.booking.id;
      const paid = await mcApi.pay(created.booking.id);
      if (paid.matched) {
        mcState.matchedWorker = await mcApi.getWorker(paid.workerId);
      } else {
        mcState.matchedWorker = null; // 매칭 가능 근무자 없음
      }
      if (mcState.role === 'parent') mcGo('parent-matched');
      return;
    } catch (e) {
      console.warn('실서버 매칭 실패, 데모 모드로 진행:', e);
    }
  }
  // 데모 폴백: 2.2초 후 기본 매칭 화면
  setTimeout(() => { if (mcState.role === 'parent') mcGo('parent-matched'); }, 2200);
}

// 리뷰 제출: 근무완료(정산) → 리뷰등록 (실서버) 후 완료 화면
async function mcSubmitReview() {
  if (mcApi.live && mcState.bookingId) {
    try {
      await mcApi.complete(mcState.bookingId);
      await mcApi.createReview({
        bookingId: mcState.bookingId,
        authorRole: 'PARENT',
        rating: mcState.rating || 5,
        tags: mcState.reviewTags,
        comment: '',
      });
    } catch (e) {
      console.warn('실서버 리뷰 등록 실패:', e);
    }
  }
  mcGo('parent-done');
}

// ------------------------------------------------------------
// 부모 편의 (예약내역 · 재예약 · 즐겨찾기)
// ------------------------------------------------------------
const MC_BOOKING_STATUS = {
  REQUESTED: ['결제대기', '#FBF1E0', '#B57F2E'],
  MATCHED: ['매칭완료', '#FCEFE9', 'var(--mc-terra-2)'],
  IN_PROGRESS: ['근무중', '#E9F0EC', 'var(--mc-pine)'],
  DONE: ['완료', '#EEF2F6', '#5A6B7B'],
  CANCELED: ['취소', '#F3EDED', '#B0757A'],
};

function mcBookingCardHtml(b, showRebook) {
  const st = MC_BOOKING_STATUS[b.status] || [b.status, '#eee', '#888'];
  const amount = (GRADES[b.grade]?.price || 0) * b.hours;
  return `
    <div class="mc-request-card">
      <div class="mc-rq-top">
        <div><h4>${CHILD_AGES[b.childAge] || '아이'} 돌봄 · ${b.grade}등급</h4><div class="mc-rq-meta">${b.date} ${b.startTime} · ${b.hours}시간</div></div>
        <span class="mc-rq-badge" style="background:${st[1]};color:${st[2]}">${st[0]}</span>
      </div>
      <div class="mc-rq-meta">📍 ${b.address}</div>
      <div style="margin-top:6px" class="mc-rq-pay">이용 금액 ${won(amount)}</div>
      ${showRebook ? `<button class="mc-live-btn" style="width:100%;margin-top:10px" onclick="mcRebook('${b.grade}')">같은 등급으로 재예약</button>` : ''}
    </div>`;
}

function mcFavCardHtml(f) {
  return `
    <div class="mc-mini-grade" style="justify-content:space-between">
      <div class="mc-mg-badge" style="background:${GRADES[f.grade]?.badge || '#888'}">${f.grade || '-'}</div>
      <div class="mc-mg-info" style="flex:1"><b>${f.name || '전문가'} ${f.licenseType || ''}</b><span>${f.careerNote || ''} · ⭐${f.ratingAvg ?? '-'}</span></div>
      <button class="mc-live-btn" style="padding:8px 12px;font-size:13px" onclick="mcRebook('${f.grade}')">예약</button>
      <button class="mc-back" style="width:30px;height:30px;font-size:14px;margin-left:6px" onclick="mcRemoveFav('${f.userId}', this)" title="즐겨찾기 해제">✕</button>
    </div>`;
}

async function mcLoadParentHome() {
  const uid = mcApi.user?.id;
  const favEl = document.getElementById('mcParentFavs');
  const recentEl = document.getElementById('mcParentRecent');
  if (!mcApi.live || !uid) {
    if (favEl) favEl.innerHTML = `<div style="font-size:13px;color:var(--mc-muted);padding:6px 2px">데모 모드 — 로그인 시 실데이터 표시</div>`;
    if (recentEl) recentEl.innerHTML = `<div class="mc-request-card" onclick="mcGo('parent-grade')" style="cursor:pointer"><div class="mc-rq-top"><div><h4>김서연 간호사</h4><div class="mc-rq-meta">지난 이용 · A등급 (데모)</div></div><span class="mc-rq-badge">데모</span></div></div>`;
    return;
  }
  try {
    const [favs, bookings] = await Promise.all([mcApi.listFavorites(), mcApi.listBookings({ parentId: uid })]);
    if (favEl) favEl.innerHTML = favs.length ? favs.map(mcFavCardHtml).join('') : `<div style="font-size:13px;color:var(--mc-muted);padding:6px 2px">아직 즐겨찾기한 전문가가 없어요</div>`;
    const recent = bookings.slice(-2).reverse();
    if (recentEl) recentEl.innerHTML = recent.length ? recent.map((b) => mcBookingCardHtml(b, true)).join('') : `<div style="font-size:13px;color:var(--mc-muted);padding:6px 2px">아직 예약 내역이 없어요</div>`;
  } catch (e) { console.warn('부모 홈 로드 실패:', e); }
}

async function mcLoadBookings() {
  const uid = mcApi.user?.id;
  const el = document.getElementById('mcBookingList');
  if (!mcApi.live || !uid) { if (el) el.innerHTML = `<div style="text-align:center;padding:20px;color:var(--mc-muted);font-size:14px">데모 모드 — 로그인 시 실데이터 표시</div>`; return; }
  try {
    const bookings = (await mcApi.listBookings({ parentId: uid })).reverse();
    el.innerHTML = bookings.length ? bookings.map((b) => mcBookingCardHtml(b, true)).join('') : `<div style="text-align:center;padding:20px;color:var(--mc-muted);font-size:14px">아직 예약 내역이 없어요</div>`;
  } catch (e) { if (el) el.innerHTML = `<div style="text-align:center;padding:20px;color:var(--mc-muted);font-size:14px">불러오기 실패</div>`; }
}

function mcRebook(gradeCode) {
  mcState.grade = GRADES[gradeCode] || null;
  mcState.date = null; mcState.time = null; mcState.hours = 2;
  mcState.address = ''; mcState.childAge = null; mcState.bookingId = null; mcState.matchedWorker = null;
  mcGo(mcState.grade ? 'parent-date' : 'parent-grade');
}

async function mcRemoveFav(workerId, btn) {
  try { await mcApi.removeFavorite(workerId); btn.closest('.mc-mini-grade')?.remove(); }
  catch (e) { alert('해제 실패: ' + e.message); }
}

async function mcAddFavorite() {
  if (!mcApi.live || !mcState.matchedWorker?.id) { alert('즐겨찾기에 추가되었습니다 ⭐ (데모)'); return; }
  try { await mcApi.addFavorite(mcState.matchedWorker.id); alert('즐겨찾기에 추가되었습니다 ⭐'); }
  catch (e) { alert('추가 실패: ' + e.message); }
}

// 랜딩의 역할 스위치 버튼 → 데모 계정 로그인
function mcSwitchRole(role) {
  document.querySelectorAll('.mc-role-btn').forEach(b => b.classList.toggle('mc-active', b.dataset.role===role));
  mcQuickLogin(role);
}

// ------------------------------------------------------------
// 인증 (로그인 / 회원가입 / 로그아웃)
// ------------------------------------------------------------
const val = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

// 로그인 후 역할별 홈으로 라우팅
function mcRouteAfterLogin(roleUpper) {
  const map = { PARENT: ['parent', 'parent-home'], WORKER: ['worker', 'worker-home'], ADMIN: ['admin', 'admin-home'] };
  const [r, screen] = map[roleUpper] || ['parent', 'parent-home'];
  mcState.role = r;
  mcRender(screen);
}

// 데모 계정 원터치 로그인 (오프라인이면 가짜 세션으로 목업 진행)
async function mcQuickLogin(role) {
  if (mcApi.live) {
    try {
      const u = await mcApi.loginDemo(role);
      mcRouteAfterLogin(u.role);
      return;
    } catch (e) {
      console.warn('데모 로그인 실패, 오프라인 데모로 진행:', e);
    }
  }
  mcApi.user = { role: role.toUpperCase(), name: role === 'parent' ? '지민맘' : role === 'worker' ? '김서연' : '관리자' };
  mcState.role = role;
  mcRender(role === 'parent' ? 'parent-home' : role === 'worker' ? 'worker-home' : 'admin-home');
}

async function mcDoLogin() {
  if (!mcApi.live) { alert('데모 모드(서버 미연결)에서는 아래 "데모 계정으로 체험"을 이용하세요.'); return; }
  try {
    const u = await mcApi.login(val('mcLoginPhone'), val('mcLoginPw'));
    mcRouteAfterLogin(u.role);
  } catch (e) { alert('로그인 실패: ' + e.message); }
}

async function mcDoSignupParent() {
  if (!mcApi.live) { alert('데모 모드에서는 회원가입을 사용할 수 없습니다. "데모 계정으로 체험"을 이용하세요.'); return; }
  const payload = { name: val('mcSuName'), phone: val('mcSuPhone'), password: val('mcSuPw'), address: val('mcSuAddr') };
  if (!payload.name || !payload.phone || !payload.password || !payload.address) { alert('모든 항목을 입력하세요.'); return; }
  try { const u = await mcApi.signupParent(payload); mcRouteAfterLogin(u.role); }
  catch (e) { alert('가입 실패: ' + e.message); }
}

let mcSignupLicense = '간호사';
function mcPickLicense(btn, lic) {
  mcSignupLicense = lic;
  document.querySelectorAll('#mcSwLicense .mc-opt').forEach(b => b.classList.toggle('mc-sel', b === btn));
}

async function mcDoSignupWorker() {
  if (!mcApi.live) { alert('데모 모드에서는 회원가입을 사용할 수 없습니다.'); return; }
  const grade = (val('mcSwGrade') || '').toUpperCase();
  if (!['A', 'B', 'C', 'D'].includes(grade)) { alert('등급은 A / B / C / D 중 하나여야 합니다.'); return; }
  const payload = {
    name: val('mcSwName'), phone: val('mcSwPhone'), password: val('mcSwPw'),
    licenseType: mcSignupLicense, grade, careerYears: parseInt(val('mcSwYears') || '0', 10), careerNote: val('mcSwNote'),
  };
  if (!payload.name || !payload.phone || !payload.password) { alert('이름·휴대폰·비밀번호를 입력하세요.'); return; }
  try {
    const u = await mcApi.signupWorker(payload);
    // 서류 이미지 업로드 (선택된 것만, 자동 축소 후)
    await mcUploadWorkerDoc('mcSwFileLicense', 'license');
    await mcUploadWorkerDoc('mcSwFileId', 'idCard');
    alert('가입 신청 완료! 관리자 승인 후 활동할 수 있어요.');
    mcRouteAfterLogin(u.role);
  } catch (e) { alert('가입 실패: ' + e.message); }
}

// 파일 input에서 이미지 읽어 축소 후 업로드
async function mcUploadWorkerDoc(inputId, kind) {
  const file = document.getElementById(inputId)?.files?.[0];
  if (!file) return;
  try {
    const dataUrl = await mcReadImageResized(file);
    if (dataUrl) await mcApi.uploadFile(kind, dataUrl, 'image/jpeg');
  } catch (e) { console.warn(`${kind} 업로드 실패:`, e); }
}

// 이미지 파일 → 최대 900px, JPEG 0.7로 축소한 data URL
function mcReadImageResized(file, maxSize = 900, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const scale = maxSize / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function mcLogout() {
  mcApi.logout();
  mcState.role = 'parent';
  document.querySelectorAll('.mc-role-btn').forEach(b => b.classList.remove('mc-active'));
  mcRender('login');
}

// ------------------------------------------------------------
// 스크롤 등장 애니메이션
// ------------------------------------------------------------
const mcObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('mc-in'); mcObserver.unobserve(e.target); } });
}, { threshold: 0.12 });

// 연동 상태 배지 갱신
function mcUpdateConnBadge() {
  const el = document.getElementById('mcConnBadge');
  if (!el) return;
  if (mcApi.live) {
    el.className = 'mc-conn mc-conn-live';
    el.textContent = '🟢 실서버 연동 중 — 예약이 실제로 저장됩니다';
  } else {
    el.className = 'mc-conn mc-conn-demo';
    el.textContent = '🔵 데모 모드 (서버 미연결 — mock 데이터)';
  }
}

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
  // 저장된 세션이 있으면 역할 홈, 없으면 로그인 화면
  if (mcApi.isLoggedIn() && mcApi.user) mcRouteAfterLogin(mcApi.user.role);
  else mcRender('login');
  document.querySelectorAll('.mc-reveal').forEach(el => mcObserver.observe(el));
  await mcApi.check();     // 백엔드 생존 확인
  mcUpdateConnBadge();
});
