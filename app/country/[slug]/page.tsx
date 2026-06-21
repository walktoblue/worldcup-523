'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'

/* ── 타입 ── */
type CountryInfo = {
  slug: string
  name_ko: string
  name_en: string
  flag_url: string | null
  flag_emoji: string | null
  continent: string | null
  capital: string | null
  population: number | null
}

type Summary = {
  total_participations: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
}

type Tournament = {
  year: number
  host: string
  round: string
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
}

type Player = {
  name_ko: string
  name_en: string
  wc_goals: number
  position: string
  notable: string
  image_url?: string | null
  video_id?: string | null
  video_title?: string | null
}

type Worldcup = {
  summary: Summary
  tournaments: Tournament[]
  top_players: Player[]
}

/* ── 유틸 ── */
function fmt(n: number | null) {
  if (n == null) return '-'
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`
  if (n >= 10_000) return `${Math.round(n / 10_000)}만`
  return n.toLocaleString()
}

const RANK_COLORS = ['#E9C349', '#C0C0C0', '#CD7F32']

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: '#E9C349' }} />
      <h3 className="text-2xl font-bold text-foreground">{children}</h3>
    </div>
  )
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? ''}`} />
}

/* ── 메인 ── */
export default function CountryPage({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(paramsPromise)
  const router = useRouter()

  const [country, setCountry] = useState<CountryInfo | null>(null)
  const [worldcup, setWorldcup] = useState<Worldcup | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/country/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return }
        setCountry(data.country)
        setWorldcup(data.worldcup)
      })
      .catch(() => setError('데이터를 불러오지 못했습니다'))
      .finally(() => setLoading(false))
  }, [slug])

  const goBack = () => router.push('/')

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive text-lg">{error}</p>
        <button onClick={goBack} className="text-secondary underline">← 홈으로</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-6 h-16 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
          >←</button>
          <h1 className="text-lg font-bold text-secondary">523 월드컵 역대 성적 찾기</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-4 md:px-6 py-8 pb-24 md:pb-12 space-y-12">

        {/* ── Section 1: 국가 소개 ── */}
        <section className="flex flex-col md:flex-row items-center gap-8">
          {/* 국기 */}
          <div className="w-full md:w-2/5 aspect-[3/2] rounded-xl overflow-hidden border border-border shadow-2xl shrink-0 bg-card flex items-center justify-center">
            {loading ? (
              <Skeleton className="w-full h-full" />
            ) : country?.flag_url ? (
              <img
                src={country.flag_url}
                alt={`${country.name_ko} 국기`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-8xl">{country?.flag_emoji ?? '🏳️'}</span>
            )}
          </div>

          {/* 기본 정보 */}
          <div className="w-full space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-12 w-3/4" />
                <div className="flex gap-3">
                  <Skeleton className="h-20 w-32" />
                  <Skeleton className="h-20 w-32" />
                  <Skeleton className="h-20 w-32" />
                </div>
              </>
            ) : (
              <>
                <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tighter uppercase">
                  {country?.name_ko}{' '}
                  <span className="text-muted-foreground text-2xl md:text-3xl font-bold">({country?.name_en})</span>
                </h2>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: '대륙', value: country?.continent ?? '-' },
                    { label: '수도', value: country?.capital ?? '-' },
                    { label: '인구', value: fmt(country?.population ?? null) },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex flex-col items-start px-5 py-4 rounded-xl border border-border min-w-[110px]"
                      style={{ backgroundColor: '#151B2E' }}
                    >
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{label}</span>
                      <span className="text-xl font-bold text-foreground mt-1">{value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── Section 2: 합산 기록 ── */}
        <section>
          <SectionTitle>월드컵 합산 기록</SectionTitle>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : worldcup ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: '참가 횟수', value: worldcup.summary.total_participations },
                { label: '총 승', value: worldcup.summary.wins },
                { label: '총 무', value: worldcup.summary.draws },
                { label: '총 패', value: worldcup.summary.losses },
                { label: '총 득점', value: worldcup.summary.goals_for },
                { label: '총 실점', value: worldcup.summary.goals_against },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col items-center justify-center text-center p-5 rounded-xl border border-white/10"
                  style={{ backgroundColor: '#151B2E' }}
                >
                  <span className="text-4xl font-extrabold" style={{ color: '#E9C349' }}>{value}</span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">{label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">기록 데이터를 불러오지 못했습니다</p>
          )}
        </section>

        {/* ── Section 3: 대회별 기록 ── */}
        <section>
          <SectionTitle>대회별 기록</SectionTitle>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : worldcup?.tournaments?.length ? (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left border-collapse">
                <thead style={{ backgroundColor: '#0A0E1A' }}>
                  <tr className="border-b border-primary/40 text-muted-foreground text-xs font-semibold uppercase tracking-widest">
                    {['연도', '개최국', '라운드', '승', '무', '패', '득점', '실점'].map(h => (
                      <th key={h} className={`px-4 py-3 ${['승', '무', '패', '득점', '실점'].includes(h) ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {worldcup.tournaments.map((t, i) => (
                    <tr
                      key={t.year}
                      style={{ backgroundColor: i % 2 === 0 ? '#151B2E' : '#1C2336' }}
                      className="border-b border-border/30 last:border-0"
                    >
                      <td className="px-4 py-3 font-bold text-foreground">{t.year}</td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">{t.host}</td>
                      <td
                        className="px-4 py-3 font-semibold"
                        style={{ color: t.round === '우승' ? '#E9C349' : 'inherit' }}
                      >{t.round}</td>
                      {[t.wins, t.draws, t.losses, t.goals_for, t.goals_against].map((v, vi) => (
                        <td key={vi} className="px-4 py-3 text-right text-foreground">{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground">대회별 기록이 없습니다</p>
          )}
        </section>

        {/* ── Section 4: TOP 3 선수 ── */}
        <section>
          <SectionTitle>
            역대 TOP 3 선수{' '}
            <span className="text-muted-foreground text-base font-normal">(월드컵 득점 기준)</span>
          </SectionTitle>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96" />)}
            </div>
          ) : worldcup?.top_players?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {worldcup.top_players.map((p, i) => (
                <div
                  key={p.name_en}
                  className="flex flex-col items-center text-center p-6 rounded-xl border border-white/10"
                  style={{ backgroundColor: '#151B2E' }}
                >
                  {/* 선수 사진 */}
                  <div
                    className="w-28 h-28 rounded-full overflow-hidden border-4 mb-4 shrink-0"
                    style={{ borderColor: RANK_COLORS[i] ?? '#434653' }}
                  >
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name_ko} className="w-full h-full object-cover object-top" />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-4xl font-extrabold"
                        style={{ backgroundColor: '#0A0E1A', color: RANK_COLORS[i] ?? '#434653' }}
                      >
                        {i + 1}
                      </div>
                    )}
                  </div>

                  <h4 className="text-xl font-bold text-foreground">{p.name_ko}</h4>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">{p.position}</p>
                  <p className="text-4xl font-extrabold mt-2" style={{ color: '#E9C349' }}>{p.wc_goals}골</p>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{p.notable}</p>

                  {/* 대표골 영상 — YouTube 새 탭으로 열기 */}
                  {p.video_id && (
                    <div className="w-full mt-5">
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">월드컵 대표골</p>
                      <a
                        href={`https://www.youtube.com/watch?v=${p.video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/10 group block"
                      >
                        <img
                          src={`https://img.youtube.com/vi/${p.video_id}/mqdefault.jpg`}
                          alt={p.video_title ?? ''}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/55 transition-colors">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-white text-xl ml-0.5">▶</span>
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 rounded px-2 py-0.5 text-xs text-white font-semibold">
                          YouTube ↗
                        </div>
                      </a>
                      {p.video_title && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 text-left">{p.video_title}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">선수 데이터가 없습니다</p>
          )}
        </section>

      </main>

      {/* 모바일 하단 네비 */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-16 bg-card border-t border-border md:hidden z-40">
        <button onClick={goBack} className="flex flex-col items-center gap-0.5 text-muted-foreground text-xs">
          <span className="text-lg">🏠</span>홈
        </button>
        <button className="flex flex-col items-center gap-0.5 text-secondary text-xs font-bold">
          <span className="text-lg">📊</span>기록
        </button>
        <button className="flex flex-col items-center gap-0.5 text-muted-foreground text-xs">
          <span className="text-lg">🏆</span>대회
        </button>
        <button className="flex flex-col items-center gap-0.5 text-muted-foreground text-xs">
          <span className="text-lg">👤</span>프로필
        </button>
      </nav>
    </div>
  )
}
