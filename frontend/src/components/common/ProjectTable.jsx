import React, { useState, useMemo } from 'react';
import { FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const ProjectTable = ({
    projects,
    onApprove,
    onReject,
    onViewDetails,
    startIndex = 0,
    searchQuery,
    onSearchChange,
    isHodOrDean = false
}) => {
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    });

    const handleSearch = () => {
        console.log("Search icon clicked for query:", searchQuery);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedProjects = useMemo(() => {
        if (!sortConfig.key) return projects;

        return [...projects].sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            // Handle different data types
            if (sortConfig.key === 'totalBudget' || sortConfig.key === 'budget') {
                aValue = a.totalBudget || a.budget || 0;
                bValue = b.totalBudget || b.budget || 0;
            } else if (sortConfig.key === 'submittedDate' || sortConfig.key === 'date') {
                aValue = a.submittedDate ? new Date(a.submittedDate).getTime() : 0;
                bValue = b.submittedDate ? new Date(b.submittedDate).getTime() : 0;
            } else if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = (bValue || '').toLowerCase();
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [projects, sortConfig]);

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return <FaSort className="text-gray-500" />;
        }
        return sortConfig.direction === 'asc' 
            ? <FaSortUp className="text-blue-400" />
            : <FaSortDown className="text-blue-400" />;
    };

    // Safe formatter for currency
    const formatCurrency = (value) => {
        if (typeof value === 'number') {
            return value.toLocaleString('en-IN');
        }
        return "N/A";
    };

    // Safe formatter for text
    const safeText = (value) => value || "N/A";
    
    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="bg-transparent overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-white">Project Applications</h2>

                <div className="relative flex items-center bg-gray-900/50 rounded-md border border-gray-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition duration-200 ease-in-out">
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-4 pr-10 py-2 bg-transparent rounded-md focus:outline-none w-64 text-white placeholder-gray-400"
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-gray-400 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-r-md"
                        aria-label="Search"
                    >
                        <FaSearch className="text-lg" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                    <thead className="bg-gray-900/70 border-b border-gray-700">
                        <tr>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase w-16 min-w-[4rem]">S.No.</th>
                            <th 
                                className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase w-64 min-w-[16rem] cursor-pointer hover:bg-gray-800 transition-colors"
                                onClick={() => handleSort('title')}
                            >
                                <div className="flex items-center gap-2">
                                    Title
                                    {getSortIcon('title')}
                                </div>
                            </th>
                            <th 
                                className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase w-32 min-w-[8rem] cursor-pointer hover:bg-gray-800 transition-colors"
                                onClick={() => handleSort('submittedDate')}
                            >
                                <div className="flex items-center gap-2">
                                    {isHodOrDean ? 'Proposed Date' : 'Start Date'}
                                    {getSortIcon('submittedDate')}
                                </div>
                            </th>
                            <th 
                                className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase w-32 min-w-[8rem] cursor-pointer hover:bg-gray-800 transition-colors"
                                onClick={() => handleSort('duration')}
                            >
                                <div className="flex items-center gap-2">
                                    {isHodOrDean ? 'Duration' : 'End Date'}
                                    {getSortIcon('duration')}
                                </div>
                            </th>
                            <th 
                                className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase w-28 min-w-[7rem] cursor-pointer hover:bg-gray-800 transition-colors"
                                onClick={() => handleSort('totalBudget')}
                            >
                                <div className="flex items-center gap-2">
                                    Budget
                                    {getSortIcon('totalBudget')}
                                </div>
                            </th>
                            <th 
                                className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase w-32 min-w-[8rem] cursor-pointer hover:bg-gray-800 transition-colors"
                                onClick={() => handleSort('currentStage')}
                            >
                                <div className="flex items-center gap-2">
                                    Current Stage
                                    {getSortIcon('currentStage')}
                                </div>
                            </th>
                            <th className="py-3 px-4 text-center text-sm font-semibold text-gray-300 uppercase w-32 min-w-[8rem]">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-700">
                        {sortedProjects.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-6 text-center text-gray-400">
                                    No projects found.
                                </td>
                            </tr>
                        ) : (
                            sortedProjects.map((project, index) => (
                                <tr key={project.id || index} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="py-4 px-4 text-gray-300">
                                        {startIndex + index + 1}
                                    </td>

                                    <td
                                        className="py-4 px-4 text-blue-400 font-medium cursor-pointer hover:text-blue-300 hover:underline truncate"
                                        onClick={() => onViewDetails(project)}
                                    >
                                        {safeText(project.title)}
                                    </td>

                                    <td className="py-4 px-4 text-gray-300 whitespace-nowrap">
                                        {isHodOrDean ? formatDate(project.submittedDate) : safeText(project.submittedDate)}
                                    </td>

                                    <td className="py-4 px-4 text-gray-300 whitespace-nowrap">
                                        {safeText(project.duration)}
                                    </td>

                                    <td className="py-4 px-4 text-gray-300 whitespace-nowrap">
                                        ₹{formatCurrency(project.totalBudget)}
                                    </td>

                                    <td className="py-4 px-4 text-gray-300 font-medium">
                                        {safeText(project.currentStage)}
                                    </td>

                                    <td className="py-4 px-4 text-center">
                                        <button
                                            onClick={() => onViewDetails(project)}
                                            className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-200 shadow-sm"
                                        >
                                            Review / Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProjectTable;
