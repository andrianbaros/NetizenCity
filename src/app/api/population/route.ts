import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getInstagramStatus } from '@/lib/instagram/api'

export async function GET() {
  try {
    const igStatus = getInstagramStatus()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isPlaceholder =
      !supabaseUrl || supabaseUrl.includes('your_supabase_url_here')

    if (isPlaceholder) {
      return NextResponse.json({
        official_population: igStatus.currentFollowers,
        registered_citizens: 3420,
        online_now: 128,
        source: igStatus.source,
        last_sync: igStatus.lastSyncAt,
      })
    }

    const supabase = await createServerSupabaseClient()

    // Call database function get_city_stats
    const { data, error } = await (supabase.rpc as any)('get_city_stats')
    if (error || !data) {
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

      const followerCount =
        (pop as { follower_count?: number } | null)?.follower_count ??
        igStatus.currentFollowers

      return NextResponse.json({
        official_population: followerCount,
        registered_citizens: registeredCount ?? 3420,
        online_now: onlineCount ?? 128,
        source: igStatus.source,
        last_sync: igStatus.lastSyncAt,
      })
    }

    return NextResponse.json({
      ...data,
      source: igStatus.source,
      last_sync: igStatus.lastSyncAt,
    })
  } catch {
    const igStatus = getInstagramStatus()
    return NextResponse.json({
      official_population: igStatus.currentFollowers,
      registered_citizens: 3420,
      online_now: 128,
      source: igStatus.source,
      last_sync: igStatus.lastSyncAt,
    })
  }
}
