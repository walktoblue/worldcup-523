import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY!

async function fetchFlagUrl(countryNameEn: string): Promise<string | null> {
  try {
    const title = encodeURIComponent(`Flag_of_${countryNameEn.replace(/ /g, '_')}`)
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`,
      { headers: { 'User-Agent': 'worldcup-523/1.0' } }
    )
    if (res.ok) {
      const data = await res.json()
      return data.originalimage?.source ?? data.thumbnail?.source ?? null
    }
  } catch {}
  return null
}

async function fetchWikiImage(nameEn: string): Promise<string | null> {
  try {
    const title = encodeURIComponent(nameEn.replace(/ /g, '_'))
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`,
      { headers: { 'User-Agent': 'worldcup-523/1.0' } }
    )
    if (res.ok) {
      const data = await res.json()
      return data.thumbnail?.source ?? null
    }
  } catch {}
  return null
}

async function searchYouTubeGoal(
  playerNameEn: string,
  countryNameEn: string
): Promise<{ id: string; title: string } | null> {
  try {
    const q = `${playerNameEn} ${countryNameEn} World Cup goal`
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`
    )
    if (!res.ok) return null
    const data = await res.json()
    const item = data.items?.[0]
    if (!item) return null
    return { id: item.id.videoId, title: item.snippet.title }
  } catch {}
  return null
}

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

  // Gemini — 기본정보 + 월드컵 기록
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

  type RawPlayer = { name_ko: string; name_en: string; wc_goals: number; position: string; notable: string }
  type GeminiResult = {
    country_info?: { continent: string; capital: string; population: number; flag_emoji: string }
    summary: unknown
    tournaments: unknown[]
    top_players: RawPlayer[]
  }

  let geminiResult: GeminiResult | null = null
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

  // 국기 이미지 + 선수별 (Wikipedia 사진 + YouTube 대표골) 병렬 조회
  const [flagUrl, enrichedPlayers] = await Promise.all([
    fetchFlagUrl(country.name_en),
    geminiResult?.top_players?.length
      ? Promise.all(
          geminiResult.top_players.map(async (p) => {
            const [image_url, video] = await Promise.all([
              fetchWikiImage(p.name_en),
              searchYouTubeGoal(p.name_en, country.name_en),
            ])
            return { ...p, image_url, video_id: video?.id ?? null, video_title: video?.title ?? null }
          })
        )
      : Promise.resolve([]),
  ])

  const ci = geminiResult?.country_info

  return NextResponse.json({
    country: {
      slug: country.slug,
      name_ko: country.name_ko,
      name_en: country.name_en,
      flag_url: flagUrl,
      flag_emoji: ci?.flag_emoji ?? null,
      continent: ci?.continent ?? null,
      capital: ci?.capital ?? null,
      population: ci?.population ?? null,
    },
    worldcup: geminiResult
      ? { summary: geminiResult.summary, tournaments: geminiResult.tournaments, top_players: enrichedPlayers }
      : null,
  })
}
