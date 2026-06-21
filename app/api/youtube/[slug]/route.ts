import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY!

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const { data: country } = await supabase
    .from('countries')
    .select('name_ko, name_en')
    .eq('slug', slug)
    .single()

  if (!country) {
    return NextResponse.json({ videos: [] })
  }

  const query = `${country.name_en} FIFA World Cup goals`

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&order=viewCount&maxResults=5&key=${YOUTUBE_API_KEY}`
    )
    if (!res.ok) {
      console.error('YouTube API error:', res.status, await res.text())
      return NextResponse.json({ videos: [] })
    }
    const data = await res.json()
    const videos = (data.items ?? []).map((item: { id: { videoId: string }; snippet: { title: string; thumbnails?: { medium?: { url: string } } } }) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url ?? null,
    }))
    return NextResponse.json({ videos })
  } catch (e) {
    console.error('YouTube fetch error:', e)
    return NextResponse.json({ videos: [] })
  }
}
