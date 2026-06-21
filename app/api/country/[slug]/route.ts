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

  // Gemini — 기본정보 + 월드컵 기록 한 번에 생성
  const prompt = `${country.name_ko}(${country.name_en}) 국가에 대해 정확한 데이터를 알려주세요.
반드시 아래 JSON 스키마만 반환하세요. 다른 텍스트 없이 JSON만:
{
  "country_info": {
    "continent": "대륙이름한국어(예:유럽/남미/북중미/아시아/아프리카/오세아니아)",
    "capital": "수도이름한국어",
    "population": 인구수숫자(정수),
    "flag_emoji": "국기이모지"
  },
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

  let geminiResult: {
    country_info?: { continent: string; capital: string; population: number; flag_emoji: string }
    summary: unknown
    tournaments: unknown[]
    top_players: Array<{ name_ko: string; name_en: string; wc_goals: number; position: string; notable: string; image_url?: string | null }>
  } | null = null

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
      if (text) geminiResult = JSON.parse(text)
    }
  } catch (e) {
    console.error('Gemini error:', e)
  }

  // Wikipedia 선수 이미지 조회
  if (geminiResult?.top_players?.length) {
    geminiResult.top_players = await Promise.all(
      geminiResult.top_players.map(async (player) => {
        try {
          const title = encodeURIComponent(player.name_en.replace(/ /g, '_'))
          const res = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`,
            { headers: { 'User-Agent': 'worldcup-523/1.0' } }
          )
          if (res.ok) {
            const data = await res.json()
            return { ...player, image_url: data.thumbnail?.source ?? null }
          }
        } catch {}
        return { ...player, image_url: null }
      })
    )
  }

  const ci = geminiResult?.country_info

  return NextResponse.json({
    country: {
      slug: country.slug,
      name_ko: country.name_ko,
      name_en: country.name_en,
      continent: ci?.continent ?? null,
      capital: ci?.capital ?? null,
      population: ci?.population ?? null,
      flag_emoji: ci?.flag_emoji ?? null,
    },
    worldcup: geminiResult
      ? { summary: geminiResult.summary, tournaments: geminiResult.tournaments, top_players: geminiResult.top_players }
      : null,
  })
}
