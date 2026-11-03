// ============================================================
// NETIZENCITY - UI Store (Zustand)
// ============================================================

import { create } from 'zustand'

export type ActiveModal =
  | null
  | 'profile'
  | 'inventory'
  | 'mall'
  | 'map'
  | 'daily_rewards'
  | 'missions'
  | 'ktn_card'
  | 'settings'
  | 'building_details'

interface UIState {
  activeModal: ActiveModal
  isChatOpen: boolean
  isMiniMapExpanded: boolean
  isMobileControlsVisible: boolean
  notifications: Array<{
    id: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    timestamp: number
  }>

  openModal: (modal: ActiveModal) => void
  closeModal: () => void
  toggleChat: () => void
  setChatOpen: (open: boolean) => void
  toggleMiniMap: () => void
  setMobileControlsVisible: (visible: boolean) => void
  addNotification: (
    notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>
  ) => void
  removeNotification: (id: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeModal: null,
  isChatOpen: false,
  isMiniMapExpanded: false,
  isMobileControlsVisible: false,
  notifications: [],

  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  setChatOpen: (isChatOpen) => set({ isChatOpen }),
  toggleMiniMap: () =>
    set((state) => ({ isMiniMapExpanded: !state.isMiniMapExpanded })),
  setMobileControlsVisible: (isMobileControlsVisible) =>
    set({ isMobileControlsVisible }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: Math.random().toString(36).substring(2, 9),
          timestamp: Date.now(),
        },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}))
