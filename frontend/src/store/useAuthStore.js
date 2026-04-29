import { create } from "zustand";
import { getCurrentUser, loginUser, signupUser } from "../services/authService";

export const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningIn: false,
    isLoggingIn: false,
    checkAuth: async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            set({ authUser: null, isCheckingAuth: false });
            console.log("Invalid or No token provided in checkAuth");
            return;
        }
        try {
            const res = await getCurrentUser();
            set({ authUser: res.user });
            console.log("User is checked Successfully.");
        } catch (error) {
            console.log("Error in checkAuth:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },
    login: async (credentials) => {
        set({ isLoggingIn: true });
        try {
            const res = await loginUser(credentials);
            console.log("User LoggedIn Successfully");
            sessionStorage.setItem("token", res.token);
            set({ authUser: res.user });
            return { success: true };

        } catch (error) {
            console.log("Login error in login store", error);
            return {
                success: false,
                message: error.response?.data?.message || "Login failed",
            };
        } finally {
            set({ isLoggingIn: false });
        }

    },
    signup: async (userData) => {
        set({ isSigningIn: true });
        try {
            const res = await signupUser(userData);
            console.log("User SignedIn Successfully");
            sessionStorage.setItem("token", res.token);
            set({ authUser: res.user });
            return { success: true };
        } catch (error) {
            console.log("Signup error:", error);
            return { success: false, message: error.response?.data.message || "Signup failed" };
        } finally {
            set({ isSigningIn: false })
        }
    },
    logout: () => {
        sessionStorage.removeItem("token");
        console.log("User LoggedOut Successfully");

        set({ authUser: null });
    },
}));