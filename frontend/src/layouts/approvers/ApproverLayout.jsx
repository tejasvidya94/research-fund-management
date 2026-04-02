import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Package } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Notification from '../../components/common/Notification';

const ApproverLayout = ({ user, onLogout, notification, showNotification, children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(() => {
        return location.pathname.includes('/equipment') ? 'equipment' : 'projects';
    });

    // Update active tab when route changes
    useEffect(() => {
        setActiveTab(location.pathname.includes('/equipment') ? 'equipment' : 'projects');
    }, [location.pathname]);

    const tabs = [
        { id: 'projects', label: 'Projects', icon: FileText, path: '/projects' },
        { id: 'equipment', label: 'Resource Allotment', icon: Package, path: '/equipment' }
    ];

    const handleTabChange = (tab) => {
        setActiveTab(tab.id);
        // Get base path (e.g., /hod-dashboard, /dean-dashboard, etc.)
        const pathParts = location.pathname.split('/');
        const basePath = pathParts.slice(0, 2).join('/'); // Gets /hod-dashboard or /dean-dashboard
        navigate(`${basePath}${tab.path}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 bg-gray-50">
            <Navbar user={user} onLogout={onLogout} />
            <Notification notification={notification} />

            <main className="max-w-screen-2xl mx-auto px-6 py-8">
                {/* Header with animated title */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-white dark:text-white text-gray-900 mb-2">
                        {user.role} Dashboard
                    </h1>
                    <p className="text-gray-400 dark:text-gray-400 text-gray-600">
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
                                    className={`relative flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                                        isActive
                                            ? 'text-white dark:text-white text-white'
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
                                    <Icon className={`relative z-10 w-5 h-5 ${isActive ? 'text-white dark:text-white text-white' : 'text-gray-400 dark:text-gray-400 text-gray-600'}`} />
                                    <span className="relative z-10">{tab.label}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Page Content with fade animation */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default ApproverLayout;

