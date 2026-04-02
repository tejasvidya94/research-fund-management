import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const uniLogo = "/University_logo.png";

const Navbar = ({ user, onLogout }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 bg-white dark:text-white text-gray-900 shadow-2xl border-b border-gray-800 dark:border-gray-800 border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex justify-between items-center flex-row">
                    <div className='flex items-center'>
                        <img src={uniLogo} alt="University Logo" className="w-16 h-16 mr-4" />
                        <div>
                            <h1 className="text-2xl font-bold dark:text-white text-gray-900">Central University of Rajasthan</h1>
                            <p className="text-gray-400 dark:text-gray-400 text-gray-600 text-sm">Research Fund Management System</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 dark:bg-gray-800 bg-gray-100 hover:bg-gray-700 dark:hover:bg-gray-700 hover:bg-gray-200 transition-colors border border-gray-700 dark:border-gray-700 border-gray-300"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5 text-yellow-400" />
                            ) : (
                                <Moon className="w-5 h-5 text-gray-700" />
                            )}
                        </button>
                        {user && (
                            <div className="text-right">
                                <div className="font-semibold dark:text-white text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-400 dark:text-gray-400 text-gray-600">{user.role}</div>
                            </div>
                        )}
                        {onLogout && (
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-2 bg-gray-800 dark:bg-gray-800 bg-gray-100 hover:bg-gray-700 dark:hover:bg-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors border border-gray-700 dark:border-gray-700 border-gray-300 dark:text-white text-gray-900"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;