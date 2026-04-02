const express = require('express');

const authMiddleware = require('../middleware/auth.middleware');
const { submitProject, getMyProjects, getProjectsForApproval, updateProjectStatus, requestBudgetUpdate, updateBudget, resubmitProject, getProjectFile } = require('../controllers/project.controller');

const router = express.Router();



// Submit a new project (Module 1: Project Submission Checklist & Declaration Form)
router.post('/submit', authMiddleware, submitProject);

// Get all projects of the logged-in user (PI)
router.get('/my-projects', authMiddleware, getMyProjects);

// Get projects for approval (for HOD, Dean, etc.)
router.get('/for-approval', authMiddleware, getProjectsForApproval);

// Update project status (approve/reject/revert)
router.post('/update-status', authMiddleware, updateProjectStatus);

// Professor requests a project budget update (only for approved projects)
router.post('/request-budget-update', authMiddleware, requestBudgetUpdate);

// R&D_MAIN handles a budget update request (approve/reject)
router.post('/update-budget', authMiddleware, updateBudget);

// Resubmit an existing (reverted) project with updates
router.post('/resubmit', authMiddleware, resubmitProject);

// Get project file for viewing/downloading
router.get('/download/:projectId', authMiddleware, getProjectFile);

module.exports = router;

