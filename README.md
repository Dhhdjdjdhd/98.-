# 맘케어(MomCare)

의료 전문가(간호사·간호조무사) 기반 시간제 육아도우미 매칭 플랫폼 — 투자유치용 프로토타입.

## 구조

```
momcare/
├─ frontend/   정적 프로토타입(HTML/CSS/JS) → Azure Static Web Apps
├─ backend/    NestJS API + 로컬 JSON 저장소 → Azure App Service (Node)
└─ .github/workflows/
    ├─ frontend.yml   프론트 배포
    └─ backend.yml    백엔드 배포
```

## 로컬 실행

```bash
# 백엔드
cd backend
npm install
npm run seed        # 초기 데모 데이터
npm run start:dev   # http://localhost:3000/api

# 프론트: frontend/index.html 을 브라우저로 열기 (서버 켜져 있으면 자동 연동)
```

## 배포 (Azure)

푸시하면 GitHub Actions가 자동 배포합니다. 최초 1회 아래 준비가 필요합니다.

### 1) 백엔드 — App Service
1. Azure Portal에서 **App Service**(Linux, Node 20) 생성
2. 웹앱 **개요 → 게시 프로필 다운로드**, 내용을 GitHub 저장소
   `Settings → Secrets → Actions`에 **`AZURE_WEBAPP_PUBLISH_PROFILE`** 로 등록
3. `.github/workflows/backend.yml` 의 `AZURE_WEBAPP_NAME` 을 실제 웹앱 이름으로 수정
4. App Service **구성**:
   - 시작 명령(Startup Command): `node dist/main.js`
   - 애플리케이션 설정: `DATA_DIR=/home/data` (재배포 후에도 데이터 유지)

### 2) 프론트 — Static Web Apps
1. Azure Portal에서 **Static Web App** 생성 (배포 소스: Other)
2. 배포 토큰을 GitHub Secret **`AZURE_STATIC_WEB_APPS_API_TOKEN`** 으로 등록
3. `frontend/api.js` 의 `MC_API_PROD` 를 배포된 백엔드 URL로 교체

### 3) 배포
```bash
git push origin main
```
