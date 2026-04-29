import React from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Package } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from "../../store/useNotificationStore";
import Notification from '../../components/common/Notification';

const ApproverLayout = () => {
    const { notification } = useNotificationStore();
    const location = useLocation();
    const navigate = useNavigate();
    const path = location.pathname.split('/').pop();
    const activeTab = (path === 'projects') ? 'projects' : (path === 'equipment') ? 'equipment' : 'projects';

    const tabs = [
        { id: 'projects', label: 'Projects', icon: FileText },
        { id: 'equipment', label: 'Resource Allotment', icon: Package }
    ];

    const handleTabChange = (tab) => {
        // Get base path (e.g., /hod-dashboard, /dean-dashboard, etc.)
        const basePath = location.pathname.split('/')[1];

        navigate(`/${basePath}/${tab.id}`);
    };

    const { authUser } = useAuthStore();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 bg-gray-50">
            <Navbar />
            <Notification notification={notification} />

            <main className="max-w-screen-2xl mx-auto px-6 py-8">
                {/* Header with animated title */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold dark:text-white text-gray-900 mb-2">
                        {authUser?.role || "Dashboard"}
                    </h1>
                    <p className=" text-gray-600 dark:text-gray-400 ">
                        Review and approve research project applications and resource allotment
                    </p>
                </motion.div>

                {/* Navigation Tabs with animations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-8"
                >
                    <div className="flex gap-2 bg-gray-800/50 dark:bg-gray-800/50 bg-white/80 backdrop-blur-sm rounded-xl p-2 border border-gray-700/50 dark:border-gray-700/50 border-gray-200 shadow-2xl">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <motion.button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab)}
                                    className={`relative flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${isActive
                                        ? 'text-white dark:text-white'
                                        : 'text-gray-400 dark:text-gray-400 text-gray-600 hover:text-gray-200 dark:hover:text-gray-200 hover:text-gray-800'
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"
                                            initial={false}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                    <Icon className={`relative z-10 w-5 h-5 ${isActive ? 'text-white dark:text-white' : 'text-gray-400 dark:text-gray-400 text-gray-600'}`} />
                                    <span className="relative z-10">{tab.label}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Page Content with fade animation */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={path || 'projects'}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet context={{ authUser }} />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default ApproverLayout;

