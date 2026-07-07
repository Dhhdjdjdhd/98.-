# 맘케어(MomCare)

의료 전문가(간호사·간호조무사) 기반 시간제 육아도우미 매칭 플랫폼 — 투자유치용 프로토타입.

## 구조

```
momcare/
├─ frontend/   정적 프로토타입(HTML/CSS/JS) → Vercel
├─ backend/    NestJS API → Render
│              저장소: MONGODB_URI 있으면 MongoDB, 없으면 로컬 JSON 자동 전환
└─ render.yaml Render 배포 설정(Blueprint)
```

## 로컬 실행 (JSON 저장소)

```bash
cd backend
npm install
npm run seed        # 초기 데모 데이터
npm run start:dev   # http://localhost:3000/api

# 프론트: frontend/index.html 을 브라우저로 열기 (서버 켜져 있으면 자동 연동)
```

## 배포

### 1) DB — MongoDB Atlas
1. [MongoDB Atlas](https://www.mongodb.com/atlas) 무료 클러스터(M0) 생성
2. **Database Access**에서 DB 사용자 생성, **Network Access**에서 `0.0.0.0/0` 허용
3. **Connect → Drivers**에서 접속 문자열(`mongodb+srv://...`) 복사 → 다음 단계에서 사용

### 2) 백엔드 — Render
1. [Render](https://render.com) → **New → Blueprint** → 이 GitHub 리포 연결 (`render.yaml` 자동 인식)
2. 환경변수 **`MONGODB_URI`** 에 위 접속 문자열 입력 후 배포
3. 배포되면 `https://momcare-api.onrender.com` 형태의 URL 확보

### 3) 프론트 — Vercel
1. [Vercel](https://vercel.com) → **Add New → Project** → 이 리포 Import
2. **Root Directory: `frontend`**, Framework: Other, Build 비움 → Deploy
3. `frontend/api.js` 의 `MC_API_PROD` 를 위 Render URL로 교체 후 커밋

> Render 무료 플랜은 미사용 시 슬립되어, 첫 요청에 수십 초 걸릴 수 있습니다(데모엔 무방).
