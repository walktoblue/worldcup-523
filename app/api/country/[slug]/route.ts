import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const { data: country, error } = await supabase
    .from('countries')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !country) {
    return NextResponse.json({ error: '국가를 찾을 수 없습니다' }, { status: 404 })
  }

  // REST Countries API
  let countryInfo = null
  try {
    const res = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(country.name_en)}?fullText=true`,
      { next: { revalidate: 86400 } }
    )
    if (res.ok) {
      const data = await res.json()
      const c = data[0]
      countryInfo = {
        flag: c.flags?.svg || c.flags?.png || null,
        continent: c.region || null,
        subregion: c.subregion || null,
        capital: c.capital?.[0] || null,
        population: c.population || null,
      }
    }
  } catch {}

  // Gemini — 월드컵 기록 생성
  const prompt = `${country.name_ko}(${country.name_en}) 국가의 FIFA 월드컵 역대 성적 데이터를 정확하게 알려주세요.
반드시 아래 JSON 스키마만 반환하세요. 다른 텍스트 없이 JSON만:
{
  "summary": {
    "total_participations": 숫자,
    "wins": 숫자,
    "draws": 숫자,
    "losses": 숫자,
    "goals_for": 숫자,
    "goals_against": 숫자
  },
  "tournaments": [
    {
      "year": 연도숫자,
      "host": "개최국한국어",
      "round": "달성라운드한국어(예:우승/준우승/4강/8강/16강/조별리그탈락)",
      "wins": 숫자,
      "draws": 숫자,
      "losses": 숫자,
      "goals_for": 숫자,
      "goals_against": 숫자
    }
  ],
  "top_players": [
    {
      "name_ko": "한국어이름",
      "name_en": "English Name",
      "wc_goals": 숫자,
      "position": "FW/MF/DF/GK",
      "notable": "대표기록한줄"
    }
  ]
}
tournaments는 최신 대회부터 내림차순. top_players는 월드컵 통산 득점 기준 상위 3명.`

  let worldcup = null
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    )
    if (res.ok) {
      const json = await res.json()
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) worldcup = JSON.parse(text)
    }
  } catch (e) {
    console.error('Gemini error:', e)
  }

  return NextResponse.json({
    country: { slug: country.slug, name_ko: country.name_ko, name_en: country.name_en, ...countryInfo },
    worldcup,
  })
}
