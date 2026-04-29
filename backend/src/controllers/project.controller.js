// const { uploadToCloudinary } = require('../utils/cloudinary');
const Project = require('../models/Project');
const ApprovalHistory = require('../models/ApprovalHistory');
const { designationToStage, stages } = require('../constants/workflow');


// Shared helper to create/update core project fields + upload file
async function buildProjectPayloadFromRequest(req, existingProject = null) {
    const {
        // Basic details
        title,
        fundingAgency,
        schemeCallRefNo,
        pi,
        piDesignation,
        piDepartment,
        coPi,
        collaboratingInstitute,
        projectStartDate,
        projectEndDate,
        totalBudget,
        // Budget heads object
        budgetHeads,
        // Flags & percentages
        fundingAgencyFormatFollowed,
        aiUsagePercentage,
        plagiarismPercentage,
        // Documents object from frontend 
        documents, // object of key values pair
        // Backward‑compat single file payload
        fileName,
        fileData,
        fileType
    } = req.body;

    // Basic required fields from Module 1
    if (!title || !fundingAgency || !pi || !totalBudget || !projectStartDate || !projectEndDate || !schemeCallRefNo) {
        throw new Error('Missing required fields');
    }

    if (!documents?.completeProposal && !existingProject) {
        throw new Error("Complete proposal is required");
    }

    const fileUrl = documents?.completeProposal || existingProject?.fileUrl || null;
    const cloudinaryPublicId = existingProject?.cloudinaryPublicId || null;

    // Compute duration string from dates for backward compatibility
    const durationString = `${projectStartDate} to ${projectEndDate}`;

    const startDate = new Date(projectStartDate);
    if (isNaN(startDate)) throw new Error("Invalid start Date")
    return {
        title,
        fundingAgency,
        schemeCallRefNo,
        pi,
        piDesignation: piDesignation || null,
        piDepartment: piDepartment || null,
        coPi: Array.isArray(coPi) ? coPi : [],
        collaboratingInstitute: collaboratingInstitute || null,
        projectStartDate: new Date(projectStartDate),
        projectEndDate: new Date(projectEndDate),
        duration: durationString,
        totalBudget,
        availableBudget: totalBudget,
        fundingAgencyFormatFollowed: typeof fundingAgencyFormatFollowed === 'boolean'
            ? fundingAgencyFormatFollowed
            // : fundingAgencyFormatFollowed === 'true',
            : parseBoolean(fundingAgencyFormatFollowed),
        aiUsagePercentage,
        plagiarismPercentage,
        budgetHeads: budgetHeads || {
            equipment: 0,
            manpower: 0,
            consumables: 0,
            travel: 0,
            contingency: 0,
            overhead: 0,
            others: 0
        },
        documents: {
            completeProposal:
                documents?.completeProposal !== undefined
                    ? documents.completeProposal
                    : existingProject?.documents?.completeProposal || null,

            endorsementLetter:
                documents?.endorsementLetter !== undefined
                    ? documents.endorsementLetter
                    : existingProject?.documents?.endorsementLetter || null,

            piCoPiUndertaking:
                documents?.piCoPiUndertaking !== undefined
                    ? documents.piCoPiUndertaking
                    : existingProject?.documents?.piCoPiUndertaking || null,

            otherSupportingDocs:
                documents?.otherSupportingDocs !== undefined
                    ? documents.otherSupportingDocs
                    : existingProject?.documents?.otherSupportingDocs || []
        },

        // Legacy file fields kept for compatibility
        fileName: fileName || existingProject?.fileName || 'research-proposal.pdf',
        fileUrl,
        fileType: fileType || existingProject?.fileType || 'application/pdf',
        cloudinaryPublicId
    };
}

// Helper function to format project with history
// fetch project details and history.
function formatProjectWithHistory(project, history = []) {
    return {
        id: project.id,
        title: project.title,
        fundingAgency: project.fundingAgency,
        schemeCallRefNo: project.schemeCallRefNo,
        pi: project.pi,
        principalInvestigator: project.pi, // Alias for compatibility
        piDesignation: project.piDesignation,
        piDepartment: project.piDepartment,
        coPi: project.coPi,
        collaboratingInstitute: project.collaboratingInstitute,
        projectStartDate: project.projectStartDate,
        projectEndDate: project.projectEndDate,
        totalBudget: project.totalBudget,
        budget: project.totalBudget, // Alias for compatibility
        availableBudget: project.availableBudget,
        budgetHeads: project.budgetHeads,
        duration: project.duration,
        fundingAgencyFormatFollowed: project.fundingAgencyFormatFollowed,
        aiUsagePercentage: project.aiUsagePercentage,
        plagiarismPercentage: project.plagiarismPercentage,
        summary: project.summary,
        submittedBy: project.submittedBy,
        submittedDate: project.submittedDate,
        status: project.status,
        currentStage: project.currentStage,
        forwardedTo: project.forwardedTo,
        documents: project.documents ? {
            completeProposal: project.documents.completeProposal || project.fileUrl || null,
            endorsementLetter: project.documents.endorsementLetter || null,
            piCoPiUndertaking: project.documents.piCoPiUndertaking || null,
            institutionalForwardingLetter: project.documents.institutionalForwardingLetter || null,
            otherSupportingDocs: project.documents.otherSupportingDocs || []
        } : {
            completeProposal: project.fileUrl || null,
            endorsementLetter: null,
            piCoPiUndertaking: null,
            institutionalForwardingLetter: null,
            otherSupportingDocs: []
        },
        fileName: project.fileName,
        fileUrl: project.fileUrl,
        fileType: project.fileType,
        cloudinaryPublicId: project.cloudinaryPublicId,
        budgetUpdateRequests: project.budgetUpdateRequests || [],
        approvalHistory: history.map(h => ({
            stage: h.stage,
            status: h.status,
            user: h.userName,
            date: h.actionDate.toISOString().split('T')[0],
            comment: h.comment
        }))
    };
}
function parseBoolean(val) {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') return val.toLowerCase() === 'true';
    return false;
}

const submitProject = async (req, res) => {
    try {
        const { v4: uuidv4 } = require('uuid');
        const projectId = `PRJ-${uuidv4()}`;
        const corePayload = await buildProjectPayloadFromRequest(req);

        const project = new Project({
            id: projectId,
            ...corePayload,
            submittedBy: req.user.email,
            status: 'Pending',
            currentStage: 'HOD',
            forwardedTo: null
        });

        await project.save();

        const formattedProject = formatProjectWithHistory(project);
        res.status(201).json(formattedProject);
    } catch (error) {
        console.error('Submit project error:', error);
        if (error.message === 'Missing required fields') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'Failed to upload file to Cloudinary') {
            return res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to submit project' });
    }
}

const getMyProjects = async (req, res) => {
    try {
        const projects = await Project.find({ submittedBy: req.user.email }).lean().sort({ submittedDate: -1 });

        // 1. Get all project IDs
        const projectIds = projects.map(p => p.id);

        // 2. Fetch ALL histories in one query
        const histories = await ApprovalHistory.find({
            projectId: { $in: projectIds }
        }).sort({ actionDate: 1 });

        // 3. Group histories by projectId
        const historyMap = {};

        histories.forEach(h => {
            if (!historyMap[h.projectId]) {
                historyMap[h.projectId] = [];
            }
            historyMap[h.projectId].push(h);
        });

        // 4. Attach history to each project
        const projectsWithHistory = projects.map(project =>
            formatProjectWithHistory(project, historyMap[project.id] || [])
        );

        res.json(projectsWithHistory);
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
}

const getProjectsForApproval = async (req, res) => {
    try {
        // Map user designation to stage (handle different naming conventions)
        const userDesignationLower = req.user.designation.toLowerCase();
        const userStage = designationToStage[userDesignationLower] || req.user.designation.toUpperCase();

        // Get projects at this user's stage OR projects this user has already reviewed
        const projectsAtStage = await Project.find({ currentStage: userStage })
            .sort({ submittedDate: -1 });

        const reviewedProjects = await ApprovalHistory.find({
            stage: userStage,
            userEmail: req.user.email
        }).distinct('projectId');

        let reviewedProjectsList = [];

        if (reviewedProjects.length > 0) {
            reviewedProjectsList = await Project.find({
                id: { $in: reviewedProjects }
            }).sort({ submittedDate: -1 });
        }

        // Combine and remove duplicates
        const allProjectIds = new Set();
        const uniqueProjects = [];

        [...projectsAtStage, ...reviewedProjectsList].forEach(project => {
            if (!allProjectIds.has(project.id)) {
                allProjectIds.add(project.id);
                uniqueProjects.push(project);
            }
        });

        // 1. Get project IDs
        const projectIds = uniqueProjects.map(p => p.id);

        // 2. Fetch histories in one query
        const histories = await ApprovalHistory.find({
            projectId: { $in: projectIds }
        }).sort({ actionDate: 1 });

        // 3. Group them
        const historyMap = {};
        histories.forEach(h => {
            if (!historyMap[h.projectId]) {
                historyMap[h.projectId] = [];
            }
            historyMap[h.projectId].push(h);
        });

        // 4. Attach
        const projectsWithHistory = uniqueProjects.map(project =>
            formatProjectWithHistory(project, historyMap[project.id] || [])
        );

        res.json(projectsWithHistory);
    } catch (error) {
        console.error('Get projects for approval error:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
}

const updateProjectStatus = async (req, res) => {
    const { projectId, status, comment, forwardedTo } = req.body;

    if (!projectId || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const project = await Project.findOne({ id: projectId }).session(session);

        if (!project) {
            throw new Error("Project Not Found");

        }

        const userStage =
            designationToStage[req.user.designation.toLowerCase()] ||
            req.user.designation.toUpperCase();

        if (project.currentStage !== userStage) {
            throw new Error("Not Authorized");

        }

        const currentStageIndex = stages.indexOf(project.currentStage);

        if (currentStageIndex === -1) {
            throw new Error("Invalid Stage");

        }

        let newStatus = project.status;
        let newStage = project.currentStage;

        const isRegistrar = userStage === 'REGISTRAR';

        // --- BUSINESS LOGIC ---
        if (status === 'Reverted') {
            newStage = currentStageIndex > 0 ? stages[currentStageIndex - 1] : 'HOD';
            newStatus = 'Reverted';
        } else if (status === 'Approved') {
            if (isRegistrar) {
                newStage = 'COMPLETED';
                newStatus = 'Approved';
            } else {
                newStage = stages[currentStageIndex + 1];
                newStatus = 'Pending';
            }
        } else if (status === 'Rejected') {
            if (!isRegistrar) {
                throw new Error("Only registrar can reject");

            }
            newStatus = 'Rejected';
        }

        // --- SAVE ---
        project.status = newStatus;
        project.currentStage = newStage;

        await project.save({ session });

        const finalComment =
            comment ||
            (status === 'Approved'
                ? 'Approved'
                : status === 'Rejected'
                    ? 'Rejected'
                    : 'Reverted');

        const history = new ApprovalHistory({
            projectId,
            stage: userStage,
            status,
            userName: req.user.name,
            userEmail: req.user.email,
            comment: finalComment
        });

        await history.save({ session });

        await session.commitTransaction();
        session.endSession();

        const formatted = formatProjectWithHistory(project);
        return res.json(formatted);

    } catch (err) {
        await session.abortTransaction();
        session.endSession();

        console.error(err);
        return res.status(500).json({ error: 'Transaction failed' });
    }
};
const requestBudgetUpdate = async (req, res) => {
    try {
        const { projectId, newTotalBudget, reason, supportingDocs } = req.body;

        if (!projectId || !newTotalBudget || !reason) {
            return res.status(400).json({ error: 'projectId, newTotalBudget and reason are required' });
        }

        const project = await Project.findOne({ id: projectId });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (project.submittedBy !== req.user.email) {
            return res.status(403).json({ error: 'Not authorized to request budget update for this project' });
        }

        if (project.status !== 'Approved') {
            return res.status(400).json({ error: 'Budget update can only be requested for approved projects' });
        }

        const numericNewBudget = Number(newTotalBudget);
        if (!Number.isFinite(numericNewBudget) || numericNewBudget <= 0) {
            return res.status(400).json({ error: 'newTotalBudget must be a positive number' });
        }

        const oldTotalBudget = project.totalBudget || 0;
        const difference = numericNewBudget - oldTotalBudget;

        // frontend already sends URLs
        let uploadedSupportingDocs = supportingDocs || [];

        // Upload any supporting documents (base64) to Cloudinary
        // let uploadedSupportingDocs = [];
        // if (Array.isArray(supportingDocs) && supportingDocs.length > 0) {
        //     try {
        // const uploadPromises = supportingDocs.map(async (docBase64, index) => {
        //     if (!docBase64) return null;
        //     const base64Data = docBase64.replace(/^data:.*;base64,/, '');
        //     const fileBuffer = Buffer.from(base64Data, 'base64');
        //     const uploadResult = await uploadToCloudinary(
        //         fileBuffer,
        //         `budget-update-supporting-${projectId}-${Date.now()}-${index}.pdf`,
        //                 'budget-update-supporting'
        //             );
        //             return uploadResult.url;
        //         });
        //         const results = await Promise.all(uploadPromises);
        //         uploadedSupportingDocs = results.filter(Boolean);
        //     } catch (err) {
        //         console.error('Budget update supporting docs upload error:', err);
        //         return res.status(500).json({ error: 'Failed to upload supporting documents' });
        //     }
        // }

        const requestEntry = {
            oldTotalBudget,
            requestedTotalBudget: numericNewBudget,
            difference,
            reason,
            supportingDocs: uploadedSupportingDocs,
            status: 'Pending',
            requestedBy: req.user.email,
            requestedByName: req.user.name
        };

        project.budgetUpdateRequests.push(requestEntry);
        await project.save();

        const formattedProject = formatProjectWithHistory(project);
        res.status(201).json(formattedProject);
    } catch (error) {
        console.error('Request budget update error:', error);
        res.status(500).json({ error: 'Failed to request budget update' });
    }
}
const updateBudget = async (req, res) => {
    const { projectId, requestId, action, comment } = req.body;

    if (!projectId || !requestId || !action) {
        return res.status(400).json({ error: 'projectId, requestId and action are required' });
    }
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const project = await Project.findOne({ id: projectId }).session(session);
        if (!project) {
            throw new Error('Project not found');
        }

        // Map user designation to stage
        const userDesignationLower = req.user.designation.toLowerCase();
        const userStage = designationToStage[userDesignationLower] || req.user.designation.toUpperCase();

        if (userStage !== 'R&D_MAIN') {
            throw new Error('Only R&D Main can handle budget update requests');
        }

        if (project.status !== 'Approved') {
            throw new Error('Budget can only be updated for approved projects');
        }

        const requestEntry = project.budgetUpdateRequests.id(requestId);
        if (!requestEntry) {
            throw new Error('Budget update request not found');
        }

        if (requestEntry.status !== 'Pending') {
            throw new Error('This budget update request has already been processed');
        }

        if (!['Approved', 'Rejected'].includes(action)) {
            throw new Error("Invalid action. Must be Approved or Rejected.");
        }

        // Apply budget update if approved
        if (action === 'Approved') {
            const oldTotal = project.totalBudget || 0;
            const newTotal = requestEntry.requestedTotalBudget;
            const delta = newTotal - oldTotal;

            project.totalBudget = newTotal;
            project.availableBudget = (project.availableBudget || 0) + delta;
            if (project.availableBudget < 0) {
                project.availableBudget = 0;
            }
        }

        requestEntry.status = action;
        requestEntry.decidedBy = req.user.name;
        requestEntry.decidedByEmail = req.user.email;
        requestEntry.decidedAt = new Date();

        await project.save({ session });

        // Log to approval history for traceability
        const historyEntry = new ApprovalHistory({
            projectId: project.id,
            stage: 'R&D_MAIN',
            status: action,
            userName: req.user.name,
            userEmail: req.user.email,
            comment: comment || (action === 'Approved'
                ? `Budget updated to ₹${requestEntry.requestedTotalBudget}`
                : 'Budget update request rejected')
        });
        await historyEntry.save({ session });

        await session.commitTransaction();
        session.endSession();

        const formattedProject = formatProjectWithHistory(project);
        res.json(formattedProject);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('Update budget error:', error);
        res.status(400).json({ error: error.message || 'Transaction failed' });
    }
}
const resubmitProject = async (req, res) => {
    try {
        const { projectId } = req.body;

        if (!projectId) {
            return res.status(400).json({ error: 'projectId is required for resubmission' });
        }

        const project = await Project.findOne({ id: projectId });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (project.submittedBy !== req.user.email) {
            return res.status(403).json({ error: 'Not authorized to resubmit this project' });
        }

        if (project.status !== 'Reverted') {
            return res.status(400).json({ error: 'Only reverted projects can be resubmitted' });
        }

        const corePayload = await buildProjectPayloadFromRequest(req, project);

        Object.assign(project, corePayload, {
            status: 'Pending',
            currentStage: 'HOD',
            forwardedTo: null
        });

        await project.save();

        // Optionally add a history entry for resubmission
        const resubmitHistory = new ApprovalHistory({
            projectId: project.id,
            stage: 'PROFESSOR',
            status: 'Resubmitted',
            userName: req.user.name,
            userEmail: req.user.email,
            comment: 'Project resubmitted after revisions'
        });
        await resubmitHistory.save();

        const formattedProject = formatProjectWithHistory(project);
        res.json(formattedProject);
    } catch (error) {
        console.error('Resubmit project error:', error);
        if (error.message === 'Missing required fields') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'Failed to upload file to Cloudinary') {
            return res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to resubmit project' });
    }
}
const getProjectFile = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findOne({ id: projectId });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        if (!project.fileUrl) {
            return res.status(404).json({ error: 'File not found for this project' });
        }

        // Redirect to the file URL (Cloudinary URL)
        res.redirect(project.fileUrl);
    } catch (error) {
        console.error('Download file error:', error);
        res.status(500).json({ error: 'Failed to retrieve file' });
    }
}

module.exports = { submitProject, getMyProjects, getProjectsForApproval, updateProjectStatus, requestBudgetUpdate, updateBudget, resubmitProject, getProjectFile }
