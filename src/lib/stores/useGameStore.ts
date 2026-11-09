// ============================================================
// NETIZENCITY - Game Store (Zustand)
// ============================================================

import { create } from 'zustand'
import type { Position, Direction, PlayerState } from '@/types/game'

export interface CityStats {
  officialPopulation: number
  registeredCitizens: number
  onlineNow: number
  lastUpdated?: string
  isApiConnected?: boolean
}

export type ViewMode = 'city' | 'tugu' | 'river' | 'stadium' | 'beach'

export interface MultiplayerRoomSummary {
  roomId: string
  name: string
  userCount: number
  maxCapacity: number
  isFull: boolean
}

export interface MultiplayerRoomPlayer {
  id: string
  name: string
  isGuest: boolean
}

interface GameState {
  isGameReady: boolean
  viewMode: ViewMode
  currentDistrict: string
  playerPosition: Position
  playerDirection: Direction
  isMoving: boolean
  remotePlayers: Map<string, PlayerState>
  cityStats: CityStats
  selectedBuilding: string | null
  selectedPlayer: PlayerState | null

  // Dedicated Multiplayer Instances (Alun-Alun Tugu & Sungai Dermaga Pancing)
  currentRoomId: string
  roomUserCount: number
  allRooms: MultiplayerRoomSummary[]
  roomPlayers: MultiplayerRoomPlayer[]

  setGameReady: (ready: boolean) => void
  setViewMode: (viewMode: ViewMode) => void
  setCurrentDistrict: (district: string) => void
  setPlayerPosition: (position: Position) => void
  setPlayerDirection: (direction: Direction) => void
  setIsMoving: (isMoving: boolean) => void
  setCityStats: (stats: Partial<CityStats>) => void
  upsertRemotePlayer: (player: PlayerState) => void
  removeRemotePlayer: (citizenId: string) => void
  setSelectedBuilding: (buildingId: string | null) => void
  setSelectedPlayer: (player: PlayerState | null) => void

  setCurrentRoomId: (currentRoomId: string) => void
  setRoomUserCount: (roomUserCount: number) => void
  setAllRooms: (allRooms: MultiplayerRoomSummary[]) => void
  setRoomPlayers: (roomPlayers: MultiplayerRoomPlayer[]) => void
}

export const useGameStore = create<GameState>((set) => ({
  isGameReady: false,
  viewMode: 'city',
  currentDistrict: 'town_square',
  playerPosition: { x: 1600, y: 1600 },
  playerDirection: 'down',
  isMoving: false,
  remotePlayers: new Map(),
  cityStats: {
    officialPopulation: 25800,
    registeredCitizens: 3420,
    onlineNow: 128,
  },
  selectedBuilding: null,
  selectedPlayer: null,

  currentRoomId: '1',
  roomUserCount: 1,
  allRooms: [{ roomId: '1', name: 'Ruang #1', userCount: 1, maxCapacity: 10, isFull: false }],
  roomPlayers: [],

  setGameReady: (isGameReady) => set({ isGameReady }),
  setViewMode: (viewMode) => set({ viewMode }),
  setCurrentDistrict: (currentDistrict) => set({ currentDistrict }),
  setPlayerPosition: (playerPosition) => set({ playerPosition }),
  setPlayerDirection: (playerDirection) => set({ playerDirection }),
  setIsMoving: (isMoving) => set({ isMoving }),
  setCityStats: (stats) =>
    set((state) => ({ cityStats: { ...state.cityStats, ...stats } })),
  upsertRemotePlayer: (player) =>
    set((state) => {
      const nextMap = new Map(state.remotePlayers)
      nextMap.set(player.citizenId, player)
      return { remotePlayers: nextMap }
    }),
  removeRemotePlayer: (citizenId) =>
    set((state) => {
      const nextMap = new Map(state.remotePlayers)
      nextMap.delete(citizenId)
      return { remotePlayers: nextMap }
    }),
  setSelectedBuilding: (selectedBuilding) => set({ selectedBuilding }),
  setSelectedPlayer: (selectedPlayer) => set({ selectedPlayer }),

  setCurrentRoomId: (currentRoomId) => set({ currentRoomId }),
  setRoomUserCount: (roomUserCount) => set({ roomUserCount }),
  setAllRooms: (allRooms) => set({ allRooms }),
  setRoomPlayers: (roomPlayers) => set({ roomPlayers }),
}))
