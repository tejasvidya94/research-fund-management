import { create } from "zustand";
import { getCurrentUser } from "../services/authService";

export const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningIn: false,
    isLoggingIn: false,
    checkAuth: async () => {
        try {
            const data = getCurrentUser();
            set({ authUser: data });
        } catch (error) {
            console.log("Error in checkAuth:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    }
}))