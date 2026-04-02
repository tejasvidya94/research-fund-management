const express = require('express');
const ProjectAccount = require('../models/ProjectAccount');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Get project accounts for the logged-in user
router.get('/my-accounts', authMiddleware, async (req, res) => {
  try {
    const accounts = await ProjectAccount.find({ submittedBy: req.user.email })
      .sort({ submittedDate: -1 });

    res.json(accounts);
  } catch (error) {
    console.error('Get project accounts error:', error);
    res.status(500).json({ error: 'Failed to fetch project accounts' });
  }
});

// Submit project account opening & budget bifurcation (Module 2)
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const {
      projectId,
      sanctionLetterNo,
      sanctionDate,
      fundingSchemeName,
      projectStartDate,
      projectEndDate,
      totalProjectCost,
      installmentNumber,
      firstInstallmentReceived,
      budgetUtilization,
      fundReceipt
    } = req.body;

    if (!projectId || !sanctionLetterNo || !sanctionDate || !projectStartDate || !projectEndDate || !totalProjectCost || !installmentNumber || !fundReceipt) {
      return res.status(400).json({ error: 'Missing required fields for project account' });
    }

    const project = await Project.findOne({ id: projectId });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const accountId = `PAC-${Date.now()}`;

    const account = new ProjectAccount({
      id: accountId,
      projectId,
      projectTitle: project.title,
      sanctionLetterNo,
      sanctionDate: new Date(sanctionDate),
      fundingSchemeName: fundingSchemeName || null,
      projectStartDate: new Date(projectStartDate),
      projectEndDate: new Date(projectEndDate),
      totalProjectCost,
      installmentNumber,
      firstInstallmentReceived: !!firstInstallmentReceived,
      budgetUtilization: budgetUtilization || [],
      fundReceipt,
      submittedBy: req.user.email,
      status: 'Pending',
      currentStage: 'HOD'
    });

    await account.save();

    res.status(201).json(account);
  } catch (error) {
    console.error('Submit project account error:', error);
    res.status(500).json({ error: 'Failed to submit project account' });
  }
});

module.exports = router;


