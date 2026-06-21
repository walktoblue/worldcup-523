'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

type Country = { slug: string; name_ko: string; name_en: string }
type HistoryItem = { slug: string; name_ko: string }

const POPULAR = [
  { slug: 'brazil', name: '브라질' },
  { slug: 'germany', name: '독일' },
  { slug: 'south-korea', name: '대한민국' },
  { slug: 'argentina', name: '아르헨티나' },
  { slug: 'france', name: '프랑스' },
]

export default function Home() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [countries, setCountries] = useState<Country[]>([])
  const [suggestions, setSuggestions] = useState<Country[]>([])
  const [error, setError] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.from('countries').select('*').order('name_ko').then(({ data }) => {
      if (data) setCountries(data)
    })
    try {
      const saved = localStorage.getItem('wc-search-history')
      if (saved) setHistory(JSON.parse(saved))
    } catch {}
  }, [])

  const saveHistory = (item: HistoryItem) => {
    const next = [item, ...history.filter(h => h.slug !== item.slug)].slice(0, 10)
    setHistory(next)
    localStorage.setItem('wc-search-history', JSON.stringify(next))
  }

  const goToCountry = (slug: string, name_ko: string) => {
    saveHistory({ slug, name_ko })
    setSuggestions([])
    router.push(`/country/${slug}`)
  }

  const handleInput = (val: string) => {
    setQuery(val)
    setError('')
    if (!val.trim()) { setSuggestions([]); return }
    const matches = countries.filter(c =>
      c.name_ko.includes(val.trim()) ||
      c.name_en.toLowerCase().includes(val.trim().toLowerCase())
    ).slice(0, 6)
    setSuggestions(matches)
  }

  const handleSearch = () => {
    const q = query.trim()
    if (!q) { setError('국가명을 입력해주세요'); return }
    const exact = countries.find(c =>
      c.name_ko === q || c.name_en.toLowerCase() === q.toLowerCase()
    )
    if (exact) { goToCountry(exact.slug, exact.name_ko); return }
    if (suggestions.length === 1) { goToCountry(suggestions[0].slug, suggestions[0].name_ko); return }
    if (suggestions.length > 1) { inputRef.current?.focus(); return }
    setError('해당 국가 데이터가 없습니다')
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-6 h-16 bg-card border-b border-border">
        <h1 className="text-lg font-bold text-secondary">523 월드컵 역대 성적 찾기</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors text-lg"
            title="검색 기록"
          >⏱</button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors text-lg"
            title="설정"
          >⚙</button>
        </div>
      </header>

      {/* 메인 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 pb-24 md:pb-12 relative overflow-hidden">
        {/* 주변광 효과 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-10 bg-primary" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-10 bg-secondary" />

        <div className="w-full max-w-3xl z-10 flex flex-col items-center gap-10 text-center">
          {/* 제목 */}
          <div className="space-y-3">
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight relative inline-block pb-3">
              월드컵 역대 성적 찾기
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 rounded-full"
                style={{ backgroundColor: '#E9C349' }}
              />
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed text-sm md:text-base">
              역대 모든 월드컵 대회의 영광과 기록을 탐색하세요.<br />
              궁금한 국가의 이름을 입력하여 역대 성적을 확인해보세요.
            </p>
          </div>

          {/* 검색창 */}
          <div className="w-full relative">
            <div
              className="flex flex-col md:flex-row items-stretch gap-2 p-2 bg-card rounded-xl border border-border"
              style={{ boxShadow: '0 0 40px -10px rgba(0,61,165,0.35)' }}
            >
              <div className="flex-1 flex items-center px-3 gap-2">
                <span className="text-muted-foreground shrink-0">🔍</span>
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={e => handleInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="국가 이름을 입력하세요 (예: 브라질, 한국)"
                  className="border-none bg-transparent shadow-none focus-visible:ring-0 text-base placeholder:text-muted-foreground"
                />
              </div>
              <Button onClick={handleSearch} className="px-8 font-bold rounded-lg">
                검색 →
              </Button>
            </div>

            {/* 자동완성 */}
            {suggestions.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-lg shadow-xl z-20 overflow-hidden">
                {suggestions.map(c => (
                  <button
                    key={c.slug}
                    onClick={() => goToCountry(c.slug, c.name_ko)}
                    className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center gap-3"
                  >
                    <span className="font-medium text-foreground">{c.name_ko}</span>
                    <span className="text-muted-foreground text-sm">{c.name_en}</span>
                  </button>
                ))}
              </div>
            )}

            {error && <p className="mt-2 text-sm text-destructive text-left">{error}</p>}
          </div>

          {/* 인기 국가 칩 */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">인기 검색 국가</span>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR.map(({ slug, name }) => (
                <button
                  key={slug}
                  onClick={() => goToCountry(slug, name)}
                  className="px-5 py-2 rounded-full border font-bold text-sm transition-colors hover:opacity-80"
                  style={{ borderColor: '#E9C349', color: '#E9C349' }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* 경기장 배경 */}
          <div
            className="w-full rounded-2xl overflow-hidden border border-border opacity-30 flex items-center justify-center"
            style={{ aspectRatio: '21/9', background: 'linear-gradient(135deg, #0A0E1A 0%, #151B2E 50%, #003DA5 100%)' }}
          >
            <span className="text-7xl">⚽</span>
          </div>
        </div>
      </main>

      {/* 모바일 하단 네비 */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-16 bg-card border-t border-border md:hidden z-40">
        <button className="flex flex-col items-center gap-0.5 text-secondary text-xs font-bold">
          <span className="text-lg">🏠</span>홈
        </button>
        <button className="flex flex-col items-center gap-0.5 text-muted-foreground text-xs">
          <span className="text-lg">📊</span>기록
        </button>
        <button className="flex flex-col items-center gap-0.5 text-muted-foreground text-xs">
          <span className="text-lg">🏆</span>대회
        </button>
        <button className="flex flex-col items-center gap-0.5 text-muted-foreground text-xs">
          <span className="text-lg">👤</span>프로필
        </button>
      </nav>

      {/* 검색 기록 모달 */}
      {showHistory && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowHistory(false)}
        >
          <div
            className="bg-card rounded-xl border border-border p-6 w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-foreground">최근 검색</h3>
              <button onClick={() => setShowHistory(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            {history.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">검색 기록이 없어요</p>
            ) : (
              <ul className="space-y-1">
                {history.map(h => (
                  <li key={h.slug}>
                    <button
                      onClick={() => { setShowHistory(false); router.push(`/country/${h.slug}`) }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground text-sm"
                    >
                      {h.name_ko}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {history.length > 0 && (
              <button
                onClick={() => { setHistory([]); localStorage.removeItem('wc-search-history') }}
                className="mt-4 text-xs text-muted-foreground hover:text-destructive w-full text-center"
              >
                기록 전체 삭제
              </button>
            )}
          </div>
        </div>
      )}

      {/* 설정 모달 */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="bg-card rounded-xl border border-border p-6 w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-foreground">앱 정보</h3>
              <button onClick={() => setShowSettings(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="text-foreground font-medium">앱 이름</span> — 523 월드컵 역대 성적 찾기</p>
              <p><span className="text-foreground font-medium">버전</span> — 1.0.0</p>
              <p><span className="text-foreground font-medium">데이터</span> — Gemini AI · REST Countries · YouTube</p>
              <p className="pt-2 leading-relaxed">역대 월드컵 참가국의 기록을 AI로 제공하는 아카이브 서비스입니다.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
