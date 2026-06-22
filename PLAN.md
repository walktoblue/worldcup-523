# 523 월드컵 역대 성적 찾기

기술 이름(slug): `worldcup-523`

## 한 줄 소개
국가 이름을 검색하면 월드컵 역대 기록과 전설적인 골 영상을 한눈에 볼 수 있는 월드컵 아카이브.

## 핵심 흐름
1. 국가 이름을 검색창에 입력한다
2. 국기·기본정보, 대회별·합산 월드컵 기록, TOP 3 선수 카드, 유튜브 TOP 5 골이 펼쳐진다
3. SNS에 링크를 공유한다

## 참고 앱/사이트
FIFA 공식 사이트(fifa.com) — 딥 다크 배경, 공식적이고 깔끔한 레이아웃, 골드 포인트

## 설정
- 로그인: 필요 없음(누구나)
- LLM API: 필요 (Google Gemini — gemini-3.5-flash, 구조화 출력 + 검색 그라운딩 활용)
- 외부 연동: REST Countries API(국가 정보, 무료·키 불필요) · YouTube Data API v3(골 영상 검색, 키 필요)
- 민감정보: 없음

## 디자인
- 강조색: `#003DA5` (FIFA 네이비 블루) — 버튼·링크·강조
- 배경: `#0A0E1A` · 글자: `#DFE2F3` · 카드: `#151B2E` · 테두리: `#434653`
- surface-container: `#1B1F2C` · surface-variant: `#313442`
- 상태색: 성공 `#16A34A` · 오류 `#DC2626`
- 포인트색: `#E9C349` (골드) — 앱 제목·순위·수치 강조
- 폰트: Noto Sans KR
- 모서리(radius): 4px(기본) · 8px(카드) · 9999px(pill 버튼)
- 그림자: 카드에 진하게, bento-glow(파랑 0.3 opacity glow)
- 레이아웃 원칙: 풀 다크 배경 + 카드 그리드, 국기를 크게 상단에 배치

## 화면
1. **검색 화면** — `/`
   - 보임: 앱 제목(1순위, 골드색) → 국가 검색창 → 인기 국가 pill 버튼들 → 상단 헤더(검색기록·설정 버튼)
   - 동작: 국가 이름 입력 후 엔터 또는 버튼 클릭 → `/country/[slug]`로 이동; 기록 버튼 → 최근 검색 드롭다운; 설정 버튼 → 앱 정보 모달
   - 데이터: 검색 기록은 localStorage 저장 (DB 불필요)
   - 상태: 빈 검색 제출 시 "국가명을 입력해주세요" / 결과 없음 시 "해당 국가 데이터가 없습니다"
   - 디자인: design/home/code.html

2. **국가 상세 화면** — `/country/[slug]`
   - 보임: 국기 + 국가명(1순위, 대형) → 기본정보(대륙·인구·수도) → 월드컵 합산 기록 stat 카드 → 대회별 기록표 → TOP 3 선수 카드 → 유튜브 TOP 5 골 임베드 그리드
   - 동작: 스크롤하며 각 섹션 탐색; 헤더 앱명 클릭 시 홈으로
   - 데이터: REST Countries API(기본정보) · Gemini API(월드컵 기록·선수 데이터) · YouTube Data API v3(영상) — 모두 서버 Route Handler에서 호출
   - 상태: 섹션별 로딩 스피너 / 유튜브 로드 실패 시 "영상을 불러올 수 없습니다" / Gemini 응답 실패 시 오류 메시지
   - 디자인: design/country_detail/code.html

## 데이터

### Gemini API가 생성하는 데이터 (DB 불필요)
국가 이름을 받아 서버에서 Gemini에게 구조화된 JSON을 요청한다. 응답 예시:
```json
{
  "summary": { "total_participations": 22, "wins": 76, "draws": 25, "losses": 19, "goals_for": 247, "goals_against": 109 },
  "tournaments": [
    { "year": 2022, "round": "우승", "wins": 7, "draws": 0, "losses": 0, "goals_for": 12, "goals_against": 3 }
  ],
  "top_players": [
    { "name_ko": "호나우두", "name_en": "Ronaldo", "wc_goals": 15, "position": "FW", "notable": "역대 브라질 최다 득점" }
  ]
}
```
→ 어느 나라든 자동 지원, 80개국 시드 불필요

### REST Countries API (실시간 조회, 키 불필요)
국기(flag), 대륙(region), 인구(population), 수도(capital), 공식 영문명

### Supabase 테이블 (최소화)
- **countries** — 검색 자동완성·URL slug용
  - `slug` text (PK) — URL 식별자 (예: brazil, south-korea)
  - `name_ko` text — 한국어 국가명
  - `name_en` text — 영문 국가명
  - 관계: 없음

## 기술 스택
Next.js (App Router, TypeScript) · Tailwind CSS · shadcn/ui · Supabase · Vercel

## MVP 범위
- 포함: 검색 화면(기록·설정 버튼 포함), 국가 상세 화면(기본정보·기록·선수·유튜브), Gemini로 모든 참가국 자동 지원
- 제외 — 다음에: 실시간 2026 월드컵 결과, 국가 간 비교 기능, 선수 개인 상세 페이지, Gemini 응답 캐싱(Supabase)

## 진행 상황
- [x] 기획 완료
- [x] Stitch 프로토타입
- [x] 연결 (GitHub · Vercel · Supabase)
- [x] 구현: 검색 화면
- [x] 구현: 국가 상세 화면
- [x] 배포 확인
