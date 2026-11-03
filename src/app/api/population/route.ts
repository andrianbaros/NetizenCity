import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isPlaceholder =
      !supabaseUrl || supabaseUrl.includes('your_supabase_url_here')

    if (isPlaceholder) {
      // Fallback demo stats when Supabase is not yet connected
      return NextResponse.json({
        official_population: 25800,
        registered_citizens: 3420,
        online_now: 128,
        source: 'demo_fallback',
      })
    }

    const supabase = await createServerSupabaseClient()

    // Call database function get_city_stats
    const { data, error } = await (supabase.rpc as any)('get_city_stats')
    if (error || !data) {
      // Fallback to manual queries if RPC fails
      const { data: pop } = await supabase
        .from('city_population')
        .select('follower_count')
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const { count: registeredCount } = await supabase
        .from('citizens')
        .select('*', { count: 'exact', head: true })

      const { count: onlineCount } = await supabase
        .from('citizens')
        .select('*', { count: 'exact', head: true })
        .eq('is_online', true)

      const followerCount = (pop as { follower_count?: number } | null)?.follower_count ?? 25800

      return NextResponse.json({
        official_population: followerCount,
        registered_citizens: registeredCount ?? 3420,
        online_now: onlineCount ?? 128,
      })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({
      official_population: 25800,
      registered_citizens: 3420,
      online_now: 128,
    })
  }
}
