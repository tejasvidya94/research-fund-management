import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
    notification: null,
    showNotification: (message, type = 'success') => {
        set({ notification: { message, type } });
        setTimeout(() => {
            set({ notification: null });
        }, 3000);
    },
    clearNotification: () => set({ notification: null }),
}));