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
            : Boolean(JSON.parse(fundingAgencyFormatFollowed)),
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
async function formatProjectWithHistory(project) {
    const history = await ApprovalHistory.find({ projectId: project.id })
        .sort({ actionDate: 1 });

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

const submitProject = async (req, res) => {
    try {
        const projectId = `PRJ-${Date.now()}`;
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

        const formattedProject = await formatProjectWithHistory(project);
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
        const projects = await Project.find({ submittedBy: req.user.email })
            .sort({ submittedDate: -1 });

        const projectsWithHistory = await Promise.all(
            projects.map(project => formatProjectWithHistory(project))
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
        const designationToStage = {
            'hod': 'HOD',
            'dean': 'DEAN',
            'r&d_helper': 'R&D_HELPER',
            'rnd_helper': 'R&D_HELPER',
            'r&d_main': 'R&D_MAIN',
            'rnd_main': 'R&D_MAIN',
            'academic_integrity_officer': 'ACADEMIC_INTEGRITY_OFFICER',
            'aio': 'ACADEMIC_INTEGRITY_OFFICER',
            'finance_officer_helper': 'FINANCE_OFFICER_HELPER',
            'finance_officer_main': 'FINANCE_OFFICER_MAIN',
            'registrar': 'REGISTRAR',
            'vc_office': 'VC_OFFICE',
            'vc': 'VICE_CHANCELLOR',
            'vice_chancellor': 'VICE_CHANCELLOR'
        };

        const userDesignationLower = req.user.designation.toLowerCase();
        const userStage = designationToStage[userDesignationLower] || req.user.designation.toUpperCase();

        // Get projects at this user's stage OR projects this user has already reviewed
        const projectsAtStage = await Project.find({ currentStage: userStage })
            .sort({ submittedDate: -1 });

        const reviewedProjects = await ApprovalHistory.find({
            stage: userStage,
            userEmail: req.user.email
        }).distinct('projectId');

        const reviewedProjectsList = await Project.find({
            id: { $in: reviewedProjects }
        }).sort({ submittedDate: -1 });

        // Combine and remove duplicates
        const allProjectIds = new Set();
        const uniqueProjects = [];

        [...projectsAtStage, ...reviewedProjectsList].forEach(project => {
            if (!allProjectIds.has(project.id)) {
                allProjectIds.add(project.id);
                uniqueProjects.push(project);
            }
        });

        const projectsWithHistory = await Promise.all(
            uniqueProjects.map(project => formatProjectWithHistory(project))
        );

        res.json(projectsWithHistory);
    } catch (error) {
        console.error('Get projects for approval error:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
}
const updateProjectStatus = async (req, res) => {
    try {
        const { projectId, status, comment, forwardedTo } = req.body;

        if (!projectId || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // reject or rever with a comment.
        if ((status === 'Rejected' || status === 'Reverted') && !comment) {
            return res.status(400).json({ error: 'Comment required for rejection/revert' });
        }

        // search a project using projectId
        const project = await Project.findOne({ id: projectId });

        if (!project) { // return if empty project object.
            return res.status(404).json({ error: 'Project not found' });
        }

        // Map user designation to stage (handle different naming conventions)
        // const designationToStage = {
        //     'hod': 'HOD',
        //     'dean': 'DEAN',
        //     'r&d_helper': 'R&D_HELPER',
        //     'rnd_helper': 'R&D_HELPER',
        //     'r&d_main': 'R&D_MAIN',
        //     'rnd_main': 'R&D_MAIN',
        //     'academic_integrity_officer': 'ACADEMIC_INTEGRITY_OFFICER',
        //     'aio': 'ACADEMIC_INTEGRITY_OFFICER',
        //     'finance_officer_helper': 'FINANCE_OFFICER_HELPER',
        //     'finance_officer_main': 'FINANCE_OFFICER_MAIN',
        //     'registrar': 'REGISTRAR',
        //     // 'vc_office': 'VC_OFFICE',
        //     // 'vc': 'VICE_CHANCELLOR',
        //     // 'vice_chancellor': 'VICE_CHANCELLOR'
        // };

        const userDesignationLower = req.user.designation.toLowerCase();
        const userStage = designationToStage[userDesignationLower] || req.user.designation.toUpperCase();

        if (project.currentStage !== userStage) { // check if the current stage and stage in the project matches.
            return res.status(403).json({ error: 'Not authorized to approve at this stage' });
        }

        // Updated approval workflow with AIO: HOD -> DEAN -> R&D_HELPER -> R&D_MAIN -> ACADEMIC_INTEGRITY_OFFICER -> FINANCE_OFFICER_HELPER -> FINANCE_OFFICER_MAIN -> REGISTRAR -> VC_OFFICE -> VICE_CHANCELLOR -> COMPLETED
        // const stages = ['HOD', 'DEAN', 'R&D_HELPER', 'R&D_MAIN', 'ACADEMIC_INTEGRITY_OFFICER', 'FINANCE_OFFICER_HELPER', 'FINANCE_OFFICER_MAIN', 'REGISTRAR', 'VC_OFFICE', 'VICE_CHANCELLOR', 'COMPLETED'];

        // const stages = [
        //     'HOD',
        //     'DEAN',
        //     'R&D_HELPER',
        //     'R&D_MAIN',
        //     'ACADEMIC_INTEGRITY_OFFICER',
        //     'FINANCE_OFFICER_HELPER',
        //     'FINANCE_OFFICER_MAIN',
        //     'REGISTRAR',
        //     'COMPLETED'
        // ];
        const currentStageIndex = stages.indexOf(project.currentStage);

        let newStatus = project.status;
        let newStage = project.currentStage;

        // Only Registrar can finally reject or accept.
        const isRegistrar = userStage === 'REGISTRAR';

        // Check if user can reject (only Registrar)
        // if (status === 'Rejected' && !isRegistrar) {
        //   return res.status(403).json({ error: 'Only Registrar can reject projects' });
        // }

        // Handle revert - all approvers can revert
        if (status === 'Reverted') {
            // Revert to previous stage or to HOD if at early stage
            if (currentStageIndex > 0) {
                newStage = stages[currentStageIndex - 1];
            } else {
                newStage = 'HOD';
            }
            newStatus = 'Reverted';
            project.forwardedTo = null;
        }
        // Handle approval
        else if (status === 'Approved') {
            // Registrar can approve if budget < 50000
            // if (userStage === 'REGISTRAR') {
            //   if (project.totalBudget < 50000) {
            //     // Registrar can fully approve projects < 50000
            //     newStage = 'COMPLETED';
            //     newStatus = 'Approved';
            //   } else {
            //     // For projects >= 50000, forward to next stage
            //     newStage = stages[currentStageIndex + 1];
            //     newStatus = 'Pending';
            //   }
            // }
            if (
                // userStage === 'REGISTRAR'
                isRegistrar) {
                newStage = 'COMPLETED';
                newStatus = 'Approved';
            }
            // R&D_MAIN and FINANCE_OFFICER_MAIN can forward to selected approver
            else if (userStage === 'R&D_MAIN' || userStage === 'FINANCE_OFFICER_MAIN') {
                if (forwardedTo && stages.includes(forwardedTo)) {
                    // Define allowed forwarding stages based on user role
                    let allowedStages = [];
                    if (userStage === 'R&D_MAIN') {
                        // R&D_MAIN can forward to: FINANCE_OFFICER_MAIN, REGISTRAR, VC_OFFICE, VICE_CHANCELLOR
                        // allowedStages = ['FINANCE_OFFICER_MAIN', 'REGISTRAR', 'VC_OFFICE', 'VICE_CHANCELLOR'];
                        allowedStages = ['FINANCE_OFFICER_MAIN', 'REGISTRAR'];
                    } else if (userStage === 'FINANCE_OFFICER_MAIN') {
                        // FINANCE_OFFICER_MAIN can forward to: REGISTRAR, VC_OFFICE, VICE_CHANCELLOR
                        // allowedStages = ['REGISTRAR', 'VC_OFFICE', 'VICE_CHANCELLOR'];
                        allowedStages = ['REGISTRAR'];
                    }
                    else {
                        // do nothing.
                    }

                    // Validate that forwarded stage is allowed for this role
                    if (!allowedStages.includes(forwardedTo)) {
                        return res.status(400).json({
                            error: `Cannot forward to ${forwardedTo}. Allowed stages: ${allowedStages.join(', ')}`
                        });
                    }

                    // Validate that forwarded stage is after current stage
                    const forwardedIndex = stages.indexOf(forwardedTo);
                    if (forwardedIndex > currentStageIndex) {
                        newStage = forwardedTo;
                        newStatus = 'Pending';
                        project.forwardedTo = forwardedTo;
                    } else {
                        return res.status(400).json({ error: 'Cannot forward to a previous stage' });
                    }
                } else {
                    // Default forward to next stage (only if next stage is in allowed list)
                    let nextStage = null;
                    if (currentStageIndex < stages.length - 2) {
                        nextStage = stages[currentStageIndex + 1];

                        // Check if next stage is allowed
                        let allowedStages = [];
                        if (userStage === 'R&D_MAIN') {
                            // allowedStages = ['FINANCE_OFFICER_MAIN', 'REGISTRAR', 'VC_OFFICE', 'VICE_CHANCELLOR'];
                            allowedStages = ['FINANCE_OFFICER_MAIN', 'REGISTRAR'];
                        } else if (userStage === 'FINANCE_OFFICER_MAIN') {
                            // allowedStages = ['REGISTRAR', 'VC_OFFICE', 'VICE_CHANCELLOR'];
                            allowedStages = ['REGISTRAR'];
                        }

                        if (allowedStages.includes(nextStage)) {
                            newStage = nextStage;
                            newStatus = 'Pending';
                        } else {
                            return res.status(400).json({ error: 'Please select a stage to forward to' });
                        }
                    } else {
                        return res.status(400).json({ error: 'Please select a stage to forward to' });
                    }
                }
            }
            // Vice Chancellor can fully approve
            // else if (isViceChancellor) {
            //   newStage = 'COMPLETED';
            //   newStatus = 'Approved';
            // }
            // Other approvers just forward to next stage
            else {
                if (currentStageIndex < stages.length - 2) {
                    newStage = stages[currentStageIndex + 1];
                    newStatus = 'Pending';
                } else {
                    return res.status(400).json({ error: 'Invalid approval action' });
                }
            }
        }
        // Handle rejection (only VC can do this)
        else if (status === 'Rejected') {
            if (!isRegistrar) {
                return res.status(403).json({ error: 'Only Registrar can reject projects' });
            }
            newStatus = 'Rejected';
        }

        // Update project
        project.status = newStatus;
        project.currentStage = newStage;
        await project.save();

        // Add to approval history
        const approvalHistory = new ApprovalHistory({
            projectId: projectId,
            stage: userStage,
            status: status,
            userName: req.user.name,
            userEmail: req.user.email,
            comment: comment || (status === 'Approved' ? 'Approved' : status === 'Rejected' ? 'Rejected' : 'Reverted')
        });

        await approvalHistory.save();

        const formattedProject = await formatProjectWithHistory(project);
        res.json(formattedProject);
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Failed to update project status' });
    }
}
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

        const formattedProject = await formatProjectWithHistory(project);
        res.status(201).json(formattedProject);
    } catch (error) {
        console.error('Request budget update error:', error);
        res.status(500).json({ error: 'Failed to request budget update' });
    }
}
const updateBudget = async (req, res) => {
    try {
        const { projectId, requestId, action, comment } = req.body;

        if (!projectId || !requestId || !action) {
            return res.status(400).json({ error: 'projectId, requestId and action are required' });
        }

        const project = await Project.findOne({ id: projectId });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Map user designation to stage
        const designationToStage = {
            'hod': 'HOD',
            'dean': 'DEAN',
            'r&d_helper': 'R&D_HELPER',
            'rnd_helper': 'R&D_HELPER',
            'r&d_main': 'R&D_MAIN',
            'rnd_main': 'R&D_MAIN',
            'academic_integrity_officer': 'ACADEMIC_INTEGRITY_OFFICER',
            'aio': 'ACADEMIC_INTEGRITY_OFFICER',
            'finance_officer_helper': 'FINANCE_OFFICER_HELPER',
            'finance_officer_main': 'FINANCE_OFFICER_MAIN',
            'registrar': 'REGISTRAR',
            'vc_office': 'VC_OFFICE',
            'vc': 'VICE_CHANCELLOR',
            'vice_chancellor': 'VICE_CHANCELLOR'
        };
        const userDesignationLower = req.user.designation.toLowerCase();
        const userStage = designationToStage[userDesignationLower] || req.user.designation.toUpperCase();

        if (userStage !== 'R&D_MAIN') {
            return res.status(403).json({ error: 'Only R&D Main can handle budget update requests' });
        }

        if (project.status !== 'Approved') {
            return res.status(400).json({ error: 'Budget can only be updated for approved projects' });
        }

        const requestEntry = project.budgetUpdateRequests.id(requestId);
        if (!requestEntry) {
            return res.status(404).json({ error: 'Budget update request not found' });
        }

        if (requestEntry.status !== 'Pending') {
            return res.status(400).json({ error: 'This budget update request has already been processed' });
        }

        if (!['Approved', 'Rejected'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action. Must be Approved or Rejected.' });
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

        await project.save();

        // Log to approval history for traceability
        const historyEntry = new ApprovalHistory({
            projectId: project.id,
            stage: 'R&D_MAIN',
            status: action === 'Approved' ? 'Budget Updated' : 'Budget Update Rejected',
            userName: req.user.name,
            userEmail: req.user.email,
            comment: comment || (action === 'Approved'
                ? `Budget updated to ₹${requestEntry.requestedTotalBudget}`
                : 'Budget update request rejected')
        });
        await historyEntry.save();

        const formattedProject = await formatProjectWithHistory(project);
        res.json(formattedProject);
    } catch (error) {
        console.error('Update budget error:', error);
        res.status(500).json({ error: 'Failed to update project budget' });
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

        const formattedProject = await formatProjectWithHistory(project);
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
