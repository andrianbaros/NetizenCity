import { NextResponse, type NextRequest } from 'next/server'
import {
  readLocalDB,
  getActiveCitizen,
  castVote,
} from '@/lib/db/localDb'

export async function GET(request: NextRequest) {
  const db = readLocalDB()
  const citizenId = request.cookies.get('nc_citizen_id')?.value
  const citizen = getActiveCitizen(citizenId)
  const activeVote = db.votes[0]
  const userVote = citizen
    ? db.vote_submissions.find(
        (vs) => vs.citizen_id === citizen.id && vs.vote_id === activeVote?.id
      )
    : null

  return NextResponse.json({
    vote: activeVote,
    hasVoted: Boolean(userVote),
    selectedOption: userVote ? userVote.selected_option : null,
    isGuest: !citizen,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { voteId, optionId } = body
    const citizenId = request.cookies.get('nc_citizen_id')?.value
    const citizen = getActiveCitizen(citizenId)
    if (!citizen) {
      return NextResponse.json(
        { error: 'Silakan masuk atau daftar terlebih dahulu untuk memberikan suara.' },
        { status: 401 }
      )
    }

    const result = castVote(citizen.id, voteId, Number(optionId))
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kesalahan server'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
