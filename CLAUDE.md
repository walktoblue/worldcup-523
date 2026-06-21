# 523 월드컵 역대 성적 찾기

국가 이름을 검색하면 월드컵 역대 기록과 전설적인 골 영상을 한눈에 볼 수 있는 월드컵 아카이브. Orange Build로 만든 입문자 MVP다.

## 스택
Next.js (App Router, TypeScript) · Tailwind CSS v4 · shadcn/ui · Supabase · Vercel

## 규칙
- 화면·디자인은 `PLAN.md`를 따른다 — 특히 `## 디자인` 토큰과 각 화면의 `상태:` 명세.
- UI는 `components/ui/`의 shadcn/ui 컴포넌트를 우선 쓴다. 색·모서리는 `app/globals.css`의 CSS 변수를 따른다.
- `app/globals.css`의 `@import` 줄은 건드리지 않는다 (Tailwind v4 파서가 깨진다). 본문 폰트는 `app/layout.tsx`에 Noto Sans KR로 설정돼 있다 — 그대로 쓴다.
- URL 경로·slug·DB 키는 ASCII만 쓴다. 한글은 화면 표시용으로만.
- Supabase는 `lib/supabase.ts`의 클라이언트로 읽고 쓴다.
- LLM API 키(GEMINI_API_KEY), YouTube API 키(YOUTUBE_API_KEY)는 서버 라우트(`app/api/...`)에서만 쓴다 — 브라우저에 노출 금지. `NEXT_PUBLIC_` 접두사 절대 붙이지 않는다.
- `PLAN.md`에 없는 화면·기능을 임의로 더하지 않는다.
- 디자인 참고: `design/home/code.html`(검색 화면), `design/country_detail/code.html`(국가 상세 화면).
