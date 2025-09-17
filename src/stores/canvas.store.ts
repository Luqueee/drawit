import { create } from 'zustand'

interface CanvasState {
    users: number;
    setUsersCount: (users: number) => void
}

export const useCanvasStore = create<CanvasState>()(
    (set) => ({
        users: 0,
        setUsersCount: (users) => set({ users }),
    }),


)