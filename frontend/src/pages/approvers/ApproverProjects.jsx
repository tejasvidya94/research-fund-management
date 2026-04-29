import React, { useRef, useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProjectTable from '../../components/common/ProjectTable';
import ProjectDetailModal from '../../components/common/modals/ProjectDetailModal';
import Pagination from '../../components/common/Pagination';
import ProjectFilters, { applyProjectFilters } from '../../components/common/ProjectFilters';
import { getStatusColor, getStatusIcon } from '../../utils/storage';
import { useAuthStore } from '../../store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProjectsForApproval, updateProjectStatus } from "../../services/projectService";

const ApproverProjects = () => {
    const { authUser } = useAuthStore();
    // tanstack query used to handle project in approverProject
    const { data: projects = [], isLoading, error } = useQuery({
        queryKey: ['projects',authUser.role],
        queryFn: fetchProjectsForApproval,
    });
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: updateProjectStatus,
        onSuccess: (updatedProject) => {
            queryClient.setQueriesData(['approver-projects'], (old = []) => old.map(p => p.id === updatedProject.id ? updatedProject : p));
        }
    });

    const userDesignation = authUser.designation?.toUpperCase();

    const [selectedProject, setSelectedProject] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        status: 'All',
        duration: 'All',
        dateFrom: '',
        dateTo: '',
        searchQuery: ''
    });

    const handleUpdateStatus = (id, newStatus, comment = '', forwardedTo = '') => {
        mutation.mutate({
            projectId: id,
            status: newStatus,
            comment,
            forwardedTo
        });
    };

    // Filter logic
    const filteredProjects = useMemo(() => {
        let displayProjects = projects.filter(
            p =>
                p.currentStage === userDesignation ||
                p.approvalHistory?.some(h => h.stage === userDesignation)
        );

        displayProjects = applyProjectFilters(displayProjects, filters);

        if (searchQuery && !filters.searchQuery) {
            const lower = searchQuery.toLowerCase();
            displayProjects = displayProjects.filter(
                project =>
                    project.title.toLowerCase().includes(lower) ||
                    project.status.toLowerCase().includes(lower)
            );
        }

        return displayProjects;
    }, [projects, filters, searchQuery, userDesignation]);

    // Calculate stats
    const stats = useMemo(() => {
        const pendingForReview = filteredProjects.filter(
            p => p.currentStage === userDesignation && p.status === 'Pending'
        ).length;

        const approvedCount = filteredProjects.filter(p => p.status === 'Approved').length;
        const rejectedCount = filteredProjects.filter(p => p.status === 'Rejected').length;
        const revertedCount = filteredProjects.filter(p => p.status === 'Reverted').length;
        const totalProjects = filteredProjects.length;

        return {
            pendingForReview,
            approvedCount,
            rejectedCount,
            totalProjects
        };
    }, [filteredProjects, userDesignation]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards with animations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
                {[
                    { label: 'Pending for Review', value: stats.pendingForReview, color: 'from-yellow-600 to-orange-600', border: 'border-yellow-500' },
                    { label: 'Approved', value: stats.approvedCount, color: 'from-green-600 to-emerald-600', border: 'border-green-500' },
                    { label: 'Rejected', value: stats.rejectedCount, color: 'from-red-600 to-rose-600', border: 'border-red-500' },
                    { label: 'Total Projects', value: stats.totalProjects, color: 'from-blue-600 to-indigo-600', border: 'border-blue-500' }
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className={`bg-gradient-to-br ${stat.color} p-6 rounded-xl shadow-2xl border-2 ${stat.border} backdrop-blur-sm`}
                    >
                        <div className="text-sm text-white/80 mb-1">{stat.label}</div>
                        <div className="text-4xl font-bold text-white">{stat.value}</div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Recent Projects Needing Attention */}
            {stats.pendingForReview > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-gray-700/50"
                >
                    <h3 className="text-2xl font-bold text-white mb-4">Projects Needing Your Review</h3>
                    <div className="space-y-4">
                        {filteredProjects
                            .filter(p => p.currentStage === userDesignation && p.status === 'Pending')
                            .slice(0, 5)
                            .map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all cursor-pointer"
                                    onClick={() => setSelectedProject(project)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-white">{project.title}</h4>
                                            <p className="text-sm text-gray-400 mt-1">PI: {project.pi || project.principalInvestigator}</p>
                                        </div>
                                        <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                                            {getStatusIcon(project.status)}
                                            {project.status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                                        <div>
                                            <span className="text-gray-400">Funding Agency:</span>
                                            <div className="font-medium text-white">{project.fundingAgency || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Duration:</span>
                                            <div className="font-medium text-white">{project.duration || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Total Budget:</span>
                                            <div className="font-medium text-white">₹{(project.totalBudget || 0).toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Current Stage:</span>
                                            <div className="font-medium text-white">{project.currentStage || 'N/A'}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                    </div>
                </motion.div>
            )}

            {/* All Projects Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden"
            >
                <div className="p-6">
                    <ProjectTable
                        projects={currentItems}
                        onApprove={(id) => handleUpdateStatus(id, 'Approved')}
                        onReject={(id) => handleUpdateStatus(id, 'Rejected')}
                        onViewDetails={(project) => setSelectedProject(project)}
                        startIndex={indexOfFirstItem}
                        searchQuery={filters.searchQuery || searchQuery}
                        onSearchChange={(value) => {
                            setSearchQuery(value);
                            setFilters({ ...filters, searchQuery: value });
                        }}
                        isHodOrDean={authUser.designation?.toLowerCase() === 'hod' || authUser.designation?.toLowerCase() === 'dean'}
                    />
                </div>

                <div className="px-6 pb-6">
                    <Pagination
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredProjects.length}
                        paginate={paginate}
                        currentPage={currentPage}
                    />
                </div>
            </motion.div>

            <ProjectDetailModal
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
                user={authUser}
                onStatusUpdate={handleUpdateStatus}
                onBudgetUpdated={(updatedProject) => {
                    if (!updatedProject) return;

                    setSelectedProject(null);
                }}
            />
        </div>
    );
};

export default ApproverProjects;

