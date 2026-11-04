// ============================================================
// NETIZENCITY - Citizen Type Definitions
// ============================================================

/** Avatar customization configuration */
export interface AvatarConfig {
  skinTone: string
  hairStyle: string
  hairColor: string
  eyeColor?: string
  shirtColor?: string
  pantsColor?: string
  shoesColor?: string
  outfit?: {
    top: string | null
    bottom: string | null
    shoes: string | null
    accessory: string | null
  }
  expression: string
}

/** KTN (Kartu Tanda Netizen) number */
export interface KTN {
  number: string
  issuedAt: string
  citizenId: string
}

/** Full citizen profile */
export interface CitizenProfile {
  id: string
  userId: string
  username: string
  displayName: string
  ktnNumber: string
  avatarConfig: AvatarConfig
  level: number
  xp: number
  job: string | null
  housingId: string | null
  housingName?: string
  district: string | null
  biography: string | null
  isOnline: boolean
  role?: 'citizen' | 'moderator' | 'admin' | 'mayor'
  lastLocation: { x: number; y: number } | null
  joinedAt: string
  updatedAt: string
}

/** Citizen summary for display in lists, chat, etc. */
export interface CitizenSummary {
  id: string
  username: string
  displayName: string
  avatarConfig: AvatarConfig
  level: number
  isOnline: boolean
  district: string | null
}

/** Citizen registration data */
export interface CitizenRegistrationData {
  username: string
  displayName: string
  avatarConfig: AvatarConfig
  biography?: string
}

/** Citizen level thresholds */
export interface LevelThreshold {
  level: number
  xpRequired: number
  title: string
  unlocks: string[]
}

/** Job definition */
export interface Job {
  id: string
  title: string
  description: string
  district: string
  salary: number
  levelRequired: number
  maxWorkers: number
  currentWorkers: number
}
