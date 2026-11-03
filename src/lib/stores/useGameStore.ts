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

interface GameState {
  isGameReady: boolean
  currentDistrict: string
  playerPosition: Position
  playerDirection: Direction
  isMoving: boolean
  remotePlayers: Map<string, PlayerState>
  cityStats: CityStats
  selectedBuilding: string | null
  selectedPlayer: PlayerState | null

  setGameReady: (ready: boolean) => void
  setCurrentDistrict: (district: string) => void
  setPlayerPosition: (position: Position) => void
  setPlayerDirection: (direction: Direction) => void
  setIsMoving: (isMoving: boolean) => void
  setCityStats: (stats: Partial<CityStats>) => void
  upsertRemotePlayer: (player: PlayerState) => void
  removeRemotePlayer: (citizenId: string) => void
  setSelectedBuilding: (buildingId: string | null) => void
  setSelectedPlayer: (player: PlayerState | null) => void
}

export const useGameStore = create<GameState>((set) => ({
  isGameReady: false,
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

  setGameReady: (isGameReady) => set({ isGameReady }),
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
}))
