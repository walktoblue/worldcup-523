# 523 월드컵 역대 성적 찾기 — 만들기 기록

## 기획 (2026-06-21)

### 무엇을, 누구를 위해
국가 이름을 검색하면 해당 국가의 월드컵 역대 기록(대회별·합산 승무패·득실점), TOP 3 선수(월드컵 다득점 기준) 카드, 유튜브 TOP 5 골 영상을 한 페이지로 볼 수 있는 아카이브 웹앱. SNS 공유를 염두에 두고 만드는 공개 서비스.

### 왜 이렇게 결정했나
- **전체 참가국 지원** — 사용자가 "~80개국 전부"를 원했다. 단, 데이터 입력 현실을 고려해 MVP는 주요 20개국 시드로 시작하고 나머지는 "데이터 준비 중" 안내로 대응한다.
- **다크 테마(FIFA 스타일)** — 참고 사이트로 FIFA 공식 사이트를 꼽았다. 딥 네이비(#0A0E1A) + 골드(#D4AF37) 조합이 공식적이고 프리미엄 느낌을 준다.
- **YouTube Data API 자동 검색** 선택 — 수동 입력(영상 ID 직접 관리) 대신 API로 자동 검색하는 방식을 택했다. 국가가 많을수록 수동 관리가 어렵기 때문. 단, Google Cloud Console에서 키 발급이 필요하고 하루 10,000 단위 무료 쿼터가 있다 (검색 1회 = 100 단위).
- **TOP 3 선수 기준** — "유명 전설 선수 직접 선정" 대신 "월드컵 통산 다득점 TOP 3"로 정했다. 객관적이고 데이터로 표현 가능해서.
- **LLM API 불필요** — 전부 정해진 데이터를 표시하는 앱이라 AI 호출이 없다.
- **REST Countries API** — 국기·인구·대륙·수도 정보는 무료·키 없이 쓸 수 있는 REST Countries API로 실시간 조회한다. Supabase에 중복 저장하지 않는다.

### 버린 선택지
- 단일 페이지(검색 + 결과 같은 화면): 스크롤 UX가 복잡해지고 URL 공유가 불가능해서 2화면으로 분리했다.
- 선수 이름 직접 큐레이션: 주관적이고 데이터 관리가 어려워 다득점 순위로 통일했다.
- 국가 전체 데이터 처음부터 시드: 80개국 수동 입력은 기획 단계에서 무리 — MVP는 20개국으로 시작한다.

---

## 연결 (2026-06-21)

### 어떻게 연결했나
- **GitHub**: `gh repo create worldcup-523 --source=. --public --push` — 한 번에 생성·푸시 완료.
- **Vercel**: `vercel link --yes --project worldcup-523` — GitHub 레포를 자동으로 감지해 연결. Vercel이 자동배포 설정까지 해줬다.
- **Supabase**: `vercel integration add supabase`가 "이미 연동 있음" 오류. 기존 연동은 도너월 프로젝트용이라 새 프로젝트를 CLI로 직접 생성했다: `supabase projects create worldcup-523-db --org-id ... --db-password ... --region us-east-1`.
- **countries 테이블**: `supabase db query --linked`로 생성 + 60개국 시드 완료. slug/name_ko/name_en 3컬럼 구조.
- **환경변수**: `vercel env add`로 NEXT_PUBLIC_SUPABASE_URL · NEXT_PUBLIC_SUPABASE_ANON_KEY를 production/preview/development 세 환경에 등록.

### 막힌 점과 해결
- **supabase login 비대화형 오류**: Claude의 Bash 도구는 TTY가 없어서 `supabase login`이 바로 실패한다. `supabase login --token <token>` 방식으로 우회 — 사용자가 Supabase 대시보드에서 액세스 토큰을 발급해 전달했다.
- **Vercel Supabase 연동 한도**: 한 계정에 Supabase 통합이 이미 있으면 `vercel integration add`가 "Cannot install more than one" 오류. Supabase CLI로 프로젝트를 직접 생성해 우회했다.
- **shadcn/ui 새 버전 인터랙티브 프롬프트**: `--yes` 플래그가 Next.js 16 + 새 shadcn 버전에서 작동 안 함. `--defaults` 플래그로 대체 (`--base radix --preset nova` 기본값 적용).

### 라이브
배포 전 (구현 단계 완료 후 확인 예정)

---

## 구현 (2026-06-22)

### 무엇을 만들었나
- **검색 화면** (`/`): 헤더(앱명·검색기록·설정), 대형 제목+골드 밑줄, 자동완성 검색창, 인기국가 칩 5개, 검색기록 모달, 설정 모달, 모바일 하단 네비
- **국가 상세 화면** (`/country/[slug]`): 국기 이미지(Wikipedia), 국가명+기본정보(대륙/수도/인구), 합산 기록 stat 카드 6개, 대회별 기록 테이블, TOP 3 선수 카드(Wikipedia 사진+월드컵 대표골 YouTube 링크), 섹션별 스켈레톤 로딩
- **API 라우트** (`/api/country/[slug]`): Gemini로 기본정보+기록 한 번에 생성 → Wikipedia 국기/선수사진 → YouTube 선수별 대표골 검색 — 모두 병렬 처리

### 왜 이렇게 결정했나
- **REST Countries API 제거** — 구현 중 v3.1이 deprecated됨을 발견. 기본정보(대륙/수도/인구/국기이모지)까지 Gemini 프롬프트에 통합해 외부 의존 줄임.
- **국기 이미지 Wikipedia에서** — `Flag_of_{country}` Wikipedia 페이지의 `originalimage.source`가 고화질 SVG/PNG를 반환함. 별도 서비스 불필요.
- **YouTube TOP5 → 선수별 대표골 1개씩** — FIFA가 YouTube 외부 embed를 차단함 (`ERR_EMBED_FORBIDDEN`). iframe 대신 새 탭 링크로 변경. 동시에 "일반 TOP5"보다 "선수별 대표골"이 컨텐츠로 더 명확해서 방향 자체를 바꿈.
- **Supabase country_cache 테이블** — Gemini 무료 플랜 15 RPM 한도 초과 시 429 오류 반복. 한 번 생성한 데이터를 DB에 7일 캐시해 Gemini 재호출 방지.

### 막힌 점과 해결
- **Gemini JSON 뒤에 추가 텍스트**: `responseMimeType: 'application/json'` 지정해도 가끔 JSON 뒤에 설명 문장 추가 → `JSON.parse` 실패. `extractFirstJSON()` 함수로 첫 번째 완전한 `{}` 블록만 추출해 해결.
- **Gemini 429 (속도 제한)**: 테스트 중 같은 나라를 여러 번 재요청하거나 여러 나라를 빠르게 연속 요청하면 분당 한도 초과. Supabase `country_cache` 테이블 도입으로 근본 해결.
- **YouTube embed 차단**: FIFA 공식 영상은 외부 embed 차단 정책 적용. `<iframe>` 제거하고 `<a target="_blank">` + YouTube 썸네일 카드로 변경.

### 라이브
https://worldcup-523.vercel.app

---

### [2026-06-22] 보안 점검
- **점검 항목**: .env git 커밋 여부 · NEXT_PUBLIC_ 키 노출 · 하드코딩 비밀 키 · service_role 클라이언트 사용 · RLS 활성화 · 민감정보 평문 저장
- **결과**: 전 항목 통과. CRITICAL 없음.
- **남은 위험**: 없음. 이 앱은 로그인·결제·개인정보 수집이 없는 공개 조회 서비스라 공격 표면이 작음. GEMINI_API_KEY·YOUTUBE_API_KEY는 서버 라우트에서만 사용되고 NEXT_PUBLIC_ 없이 관리됨. country_cache 테이블은 RLS + anon INSERT 정책으로 공개 캐시 특성상 허용(공개 월드컵 데이터만 저장).
- **판단 근거**: grep에서 `card` 키워드가 매치됐으나 전부 Tailwind CSS 클래스명(bg-card 등)으로 민감정보와 무관한 false positive.
