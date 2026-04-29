import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { authUser, isCheckingAuth } = useAuthStore();
    if (isCheckingAuth) {
        // return <div>Loading...</div>;
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="dark:text-gray-400 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }
    if (!authUser) {
        return <Navigate to='/' replace />
    }
    if (allowedRoles && !allowedRoles.includes(authUser.designation?.toLowerCase())) {
        return <Navigate to='/' replace />
    }
    return children;
}

export default ProtectedRoute;