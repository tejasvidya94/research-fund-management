import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, FileText, Package } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Dashboard from '../../pages/professor/Dashboard';
import Projects from '../../pages/professor/Projects';
import Equipment from '../../pages/professor/Equipment';
import ProjectForm from '../../components/common/forms/ProjectForm';
import EquipmentForm from '../../components/common/forms/EquipmentForm';
import Notification from '../../components/common/Notification';

export default function MainLayout({
  user,
  onLogout,
  notification,
  showNotification
}) {
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [projects, setProjects] = useState([]);
  const [equipmentRequests, setEquipmentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const navigate = useNavigate();
  const location = useLocation();

  // Update active tab when location changes
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const currentTab = pathParts[1] || 'dashboard';
    setActiveTab(currentTab);
  }, [location.pathname]);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
    fetchEquipment();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('/api/projects/my-projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      } else {
        console.error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipment = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('/api/equipment/my-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setEquipmentRequests(data);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const handleTabChange = (tab) => {
    navigate(tab.id);
  };

  // New / updated Module 1 project submission handler
  const handleProjectSubmit = async (formData, coPis, budgetHeads, fileData, existingProjectId) => {
    try {
      const token = sessionStorage.getItem('token');

      // Build payload matching updated backend /api/projects/submit
      const projectData = {
        title: formData.get('title'),
        fundingAgency: formData.get('fundingAgency'),
        schemeCallRefNo: formData.get('schemeCallRefNo'),
        pi: formData.get('pi'),
        piDesignation: formData.get('piDesignation'),
        piDepartment: formData.get('piDepartment'),
        coPi: coPis,
        collaboratingInstitute: formData.get('collaboratingInstitute') || null,
        projectStartDate: formData.get('projectStartDate'),
        projectEndDate: formData.get('projectEndDate'),
        totalBudget: parseFloat(formData.get('totalBudget')),
        fundingAgencyFormatFollowed: formData.get('fundingAgencyFormatFollowed') === 'true',
        aiUsagePercentage: parseFloat(formData.get('aiUsagePercentage')),
        plagiarismPercentage: parseFloat(formData.get('plagiarismPercentage')),
        budgetHeads,
        documents: {
          completeProposal: fileData?.completeProposal || null,
          endorsementLetter: fileData?.endorsementLetter || null,
          piCoPiUndertaking: fileData?.piCoPiUndertaking || null,
          otherSupportingDocs: fileData?.otherSupportingDocs || []
        },
        // For backend backward-compatibility – main proposal file
        fileData: fileData?.completeProposal || null
      };

      const endpoint = existingProjectId ? '/api/projects/resubmit' : '/api/projects/submit';
      const payload = existingProjectId
        ? { ...projectData, projectId: existingProjectId }
        : projectData;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newProject = await res.json();
        if (existingProjectId) {
          setProjects(projects.map(p => p.id === existingProjectId ? newProject : p));
          showNotification('Project updated and resubmitted successfully!');
        } else {
          setProjects([newProject, ...projects]);
          showNotification('Project submitted successfully!');
        }
        setShowNewProjectForm(false);
        setEditingProject(null);
      } else {
        const error = await res.json();
        showNotification(error.error || 'Failed to submit project', 'error');
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      showNotification('Failed to submit project', 'error');
    }
  };

  // Module 3: Project Grant (Form PC) submission handler
  const handleEquipmentSubmit = async (formData, items, enclosureData, totalAmount) => {
    try {
      const token = sessionStorage.getItem('token');

      const grantData = {
        projectId: formData.get('projectId'),
        grantType: formData.get('grantType'),
        budgetHead: formData.get('budgetHead'),
        amountSanctioned: parseFloat(formData.get('amountSanctioned')),
        availableBalance: parseFloat(formData.get('availableBalance')),
        procurementMode: formData.get('procurementMode'),
        items,
        totalAmount,
        enclosures: enclosureData,
        requestType: formData.get('requestType')
      };

      const res = await fetch('/api/equipment/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(grantData)
      });

      if (res.ok) {
        const newRequest = await res.json();
        setEquipmentRequests([newRequest, ...equipmentRequests]);
        setShowEquipmentForm(false);
        showNotification('Project grant request submitted successfully! It will be reviewed by the approval committee.');
      } else {
        const error = await res.json();
        showNotification(error.error || 'Failed to submit project grant request', 'error');
      }
    } catch (error) {
      console.error('Error submitting project grant:', error);
      showNotification('Failed to submit project grant request', 'error');
    }
  };

  const approvedProjects = projects.filter(p => p.status.includes('Approved'));

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'projects', label: 'My Projects', icon: FileText },
    { id: 'equipment', label: 'Equipment Requests', icon: Package }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="dark:text-gray-400 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold dark:text-white text-gray-900 mb-2">
            Professor Dashboard
          </h1>
          <p className="dark:text-gray-400 text-gray-600">
            Manage your research projects and equipment requests
          </p>
        </motion.div>

        {/* Navigation Tabs with animations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex gap-2  dark:bg-gray-800/50 bg-white/80 backdrop-blur-sm rounded-xl p-2 border border-gray-700/50 dark:border-gray-700/50 border-gray-200 shadow-2xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => handleTabChange(tab)}
                  className={`relative flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${isActive
                    ? ' dark:text-white text-white'
                    : ' dark:text-gray-400 text-gray-600 dark:hover:text-gray-200 hover:text-gray-800'
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
                  <Icon className={`relative z-10 w-5 h-5 ${isActive ? 'dark:text-white text-white' : 'dark:text-gray-400 text-gray-600'}`} />
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
            <Routes>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route
                path="dashboard"
                element={
                  <Dashboard
                    projects={projects}
                    onNewProject={() => setShowNewProjectForm(true)}
                  />
                }
              />
              <Route
                path="projects"
                element={
                  <Projects
                    projects={projects}
                    onNewProject={() => {
                      setEditingProject(null);
                      setShowNewProjectForm(true);
                    }}
                    onEditProject={(project) => {
                      setEditingProject(project);
                      setShowNewProjectForm(true);
                    }}
                    onRequestEquipment={() => setShowEquipmentForm(true)}
                    showNotification={showNotification}
                  />
                }
              />
              <Route
                path="equipment"
                element={
                  <Equipment
                    equipmentRequests={equipmentRequests}
                    approvedProjects={approvedProjects}
                    onNewRequest={() => setShowEquipmentForm(true)}
                  />
                }
              />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {showNewProjectForm && (
        <ProjectForm
          user={user}
          onSubmit={handleProjectSubmit}
          onCancel={() => {
            setShowNewProjectForm(false);
            setEditingProject(null);
          }}
          project={editingProject}
        />
      )}

      {showEquipmentForm && (
        <EquipmentForm
          approvedProjects={approvedProjects}
          onSubmit={handleEquipmentSubmit}
          onCancel={() => setShowEquipmentForm(false)}
        />
      )}
    </div>
  );
}