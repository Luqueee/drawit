import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface MusicState {
    volume: number
    muted: boolean

    setVolume: (volume: number) => void
    setMuted: (muted: boolean) => void
}

export const useMusicStore = create<MusicState>()(
    persist(
        (set) => ({
            volume: 0.5,
            muted: false,

            setVolume: (volume) => set({ volume }),
            setMuted: (muted) => set({ muted }),
        }),
        {
            name: 'music-storage', // unique name for localStorage key
            storage: createJSONStorage(() => localStorage),
        }
    )
)