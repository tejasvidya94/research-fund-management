const EquipmentRequest = require('../models/EquipmentRequest');
const EquipmentApprovalHistory = require('../models/EquipmentApprovalHistory');
const Project = require('../models/Project');
const { formatEquipmentRequestWithHistory } = require('../utils/equipmentFormatter');
const { designationToStage, stages } = require('../constants/workflow');

const submitEquipmentRequest = async (req, res) => {
    try {
        const {
            projectId,
            grantType,
            budgetHead,
            amountSanctioned,
            availableBalance,
            procurementMode,
            items,
            totalAmount,
            enclosures,
            requestType
        } = req.body;

        if (!projectId || !grantType || !budgetHead || !procurementMode || !items || !Array.isArray(items) || items.length === 0 || !totalAmount) {
            return res.status(400).json({ error: 'Missing required fields for project grant' });
        }

        // Get project details for validation and title
        const project = await Project.findOne({ id: projectId });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (project.submittedBy !== req.user.email) {
            return res.status(403).json({ error: 'Not authorized for this project' });
        }

        if (project.availableBudget < totalAmount) {
            return res.status(400).json({
                error: `Insufficient budget. Available: ₹${project.availableBudget.toLocaleString()}`
            });
        }

        const requestId = `PG-${Date.now()}`;

        // Create project grant with Pending status at HOD stage
        const grant = new EquipmentRequest({
            id: requestId,
            projectId,
            projectTitle: project.title,
            grantType,
            budgetHead,
            amountSanctioned,
            availableBalance,
            procurementMode,
            items,
            totalAmount,
            enclosures: enclosures || {},
            requestType,
            submittedBy: req.user.email,
            status: 'Pending',
            currentStage: 'HOD'
        });

        await grant.save();

        const formattedRequest = await formatEquipmentRequestWithHistory(grant);
        res.status(201).json(formattedRequest);
    } catch (error) {
        console.error('Submit resource allotment request error:', error);
        res.status(500).json({ error: 'Failed to submit resource allotment request' });
    }
}

const updateEquipmentRequestStatus = async (req, res) => {
    try {
        const { equipmentRequestId, status, comment, forwardedTo } = req.body;

        if (!equipmentRequestId || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if ((status === 'Rejected' || status === 'Reverted') && !comment) {
            return res.status(400).json({ error: 'Comment required for rejection/revert' });
        }

        const request = await EquipmentRequest.findOne({ id: equipmentRequestId });

        if (!request) {
            return res.status(404).json({ error: 'Resource allotment request not found' });
        }

        // Map user designation to stage
        // const designationToStage = {
        //     'hod': 'HOD',
        //     'dean': 'DEAN',
        //     // 'r&d_helper': 'R&D_HELPER',
        //     'rnd_helper': 'R&D_HELPER',
        //     // 'r&d_main': 'R&D_MAIN',
        //     'rnd_main': 'R&D_MAIN',
        //     // 'academic_integrity_officer': 'ACADEMIC_INTEGRITY_OFFICER',
        //     'aio': 'ACADEMIC_INTEGRITY_OFFICER',
        //     'finance_officer_helper': 'FINANCE_OFFICER_HELPER',
        //     'finance_officer_main': 'FINANCE_OFFICER_MAIN',
        //     'registrar': 'REGISTRAR',
        //     'vc_office': 'VC_OFFICE',
        //     // 'vc': 'VICE_CHANCELLOR',
        //     'vice_chancellor': 'VICE_CHANCELLOR'
        // };

        const userDesignationLower = req.user.designation.toLowerCase();
        const userStage = designationToStage[userDesignationLower] || req.user.designation.toUpperCase();

        if (request.currentStage !== userStage) {
            return res.status(403).json({ error: 'Not authorized to approve at this stage' });
        }

        // Updated approval workflow with AIO: HOD -> DEAN -> R&D_HELPER -> R&D_MAIN -> ACADEMIC_INTEGRITY_OFFICER -> FINANCE_OFFICER_HELPER -> FINANCE_OFFICER_MAIN -> REGISTRAR -> VC_OFFICE -> VICE_CHANCELLOR -> COMPLETED
        // const stages = ['HOD', 'DEAN', 'R&D_HELPER', 'R&D_MAIN', 'ACADEMIC_INTEGRITY_OFFICER', 'FINANCE_OFFICER_HELPER', 'FINANCE_OFFICER_MAIN', 'REGISTRAR', 'VC_OFFICE', 'VICE_CHANCELLOR', 'COMPLETED'];
        const currentStageIndex = stages.indexOf(request.currentStage);

        let newStatus = request.status;
        let newStage = request.currentStage;

        // Only Vice Chancellor can reject or approve (final approval)
        const isViceChancellor = userStage === 'VICE_CHANCELLOR';

        // Check if user can reject (only VC)
        if (status === 'Rejected' && !isViceChancellor) {
            return res.status(403).json({ error: 'Only Vice Chancellor can reject resource allotment requests' });
        }

        // Handle revert - all approvers can revert
        if (status === 'Reverted') {
            // Revert back to HOD stage so professor can make changes and resubmit
            newStage = 'HOD';
            newStatus = 'Reverted';
            request.forwardedTo = null;
        }
        // Handle approval
        else if (status === 'Approved') {
            // R&D_MAIN and FINANCE_OFFICER_MAIN can forward to selected approver
            if (userStage === 'R&D_MAIN' || userStage === 'FINANCE_OFFICER_MAIN') {
                if (forwardedTo && stages.includes(forwardedTo)) {
                    // Define allowed forwarding stages based on user role
                    let allowedStages = [];
                    if (userStage === 'R&D_MAIN') {
                        // R&D_MAIN can forward to: FINANCE_OFFICER_MAIN, REGISTRAR, VC_OFFICE, VICE_CHANCELLOR
                        allowedStages = ['FINANCE_OFFICER_MAIN', 'REGISTRAR', 'VC_OFFICE', 'VICE_CHANCELLOR'];
                    } else if (userStage === 'FINANCE_OFFICER_MAIN') {
                        // FINANCE_OFFICER_MAIN can forward to: REGISTRAR, VC_OFFICE, VICE_CHANCELLOR
                        allowedStages = ['REGISTRAR', 'VC_OFFICE', 'VICE_CHANCELLOR'];
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
                        request.forwardedTo = forwardedTo;
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
                            allowedStages = ['FINANCE_OFFICER_MAIN', 'REGISTRAR', 'VC_OFFICE', 'VICE_CHANCELLOR'];
                        } else if (userStage === 'FINANCE_OFFICER_MAIN') {
                            allowedStages = ['REGISTRAR', 'VC_OFFICE', 'VICE_CHANCELLOR'];
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
            else if (isViceChancellor) {
                newStage = 'COMPLETED';
                newStatus = 'Approved - Fund Released';

                // Deduct budget from project only when VC approves
                const project = await Project.findOne({ id: request.projectId });
                if (!project) {
                    return res.status(404).json({ error: 'Associated project not found' });
                }
                if (project.availableBudget < request.totalAmount) {
                    return res.status(400).json({
                        error: `Insufficient budget. Available: ₹${project.availableBudget.toLocaleString()}`
                    });
                }

                project.availableBudget -= request.totalAmount;
                await project.save();
            }
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
            if (!isViceChancellor) {
                return res.status(403).json({ error: 'Only Vice Chancellor can reject resource allotment requests' });
            }
            newStatus = 'Rejected';
        }

        // Update resource allotment request
        request.status = newStatus;
        request.currentStage = newStage;
        await request.save();

        // Add to approval history
        const approvalHistory = new EquipmentApprovalHistory({
            equipmentRequestId: equipmentRequestId,
            stage: userStage,
            status: status,
            userName: req.user.name,
            userEmail: req.user.email,
            comment: comment || (status === 'Approved' ? 'Approved' : status === 'Rejected' ? 'Rejected' : 'Reverted')
        });

        await approvalHistory.save();

        const formattedRequest = await formatEquipmentRequestWithHistory(request);
        res.json(formattedRequest);
    } catch (error) {
        console.error('Update resource allotment request status error:', error);
        res.status(500).json({ error: 'Failed to update resource allotment request status' });
    }

}

const fetchMyEquipmentRequests = async (req, res) => {
    try {
        console.log('USER: ', req.user);
        const requests = await EquipmentRequest.find({ submittedBy: req.user.email })
            .sort({ submittedDate: -1 });

        console.time("fetchRequests");
        const formattedRequests = await Promise.all(
            requests.map(request => formatEquipmentRequestWithHistory(request))
        );
        console.timeEnd("fetchRequests");

        res.json(formattedRequests);
    } catch (error) {
        console.error('Get resource allotment requests error:', error);
        res.status(500).json({ error: 'Failed to fetch resource allotment requests' });
    }
}

const fetchEquipmentRequestsForApproval = async (req, res) => {
    try {
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
        //     'vc_office': 'VC_OFFICE',
        //     'vc': 'VICE_CHANCELLOR',
        //     'vice_chancellor': 'VICE_CHANCELLOR'
        // };

        const userDesignationLower = req.user.designation.toLowerCase();
        const userStage = designationToStage[userDesignationLower] || req.user.designation.toUpperCase();

        // Get equipment requests at this user's stage OR requests this user has already reviewed
        const requestsAtStage = await EquipmentRequest.find({ currentStage: userStage })
            .sort({ submittedDate: -1 });

        const reviewedRequestIds = await EquipmentApprovalHistory.find({
            stage: userStage,
            userEmail: req.user.email
        }).distinct('equipmentRequestId');

        const reviewedRequests = await EquipmentRequest.find({
            id: { $in: reviewedRequestIds }
        }).sort({ submittedDate: -1 });

        // Combine and remove duplicates
        const allRequestIds = new Set();
        const uniqueRequests = [];

        [...requestsAtStage, ...reviewedRequests].forEach(request => {
            if (!allRequestIds.has(request.id)) {
                allRequestIds.add(request.id);
                uniqueRequests.push(request);
            }
        });

        const requestsWithHistory = await Promise.all(
            uniqueRequests.map(request => formatEquipmentRequestWithHistory(request))
        );

        res.json(requestsWithHistory);
    } catch (error) {
        console.error('Get resource allotment requests for approval error:', error);
        res.status(500).json({ error: 'Failed to fetch resource allotment requests' });
    }
}

const uploadEquipmentBill = async (req, res) => {
    try {
        const { grantId, billFileName, billFileData, billFileType } = req.body;

        if (!grantId || !billFileData) {
            return res.status(400).json({ error: 'Missing required fields: grantId and bill file' });
        }

        const EquipmentRequest = require('../models/EquipmentRequest');
        const grant = await EquipmentRequest.findOne({ id: grantId });

        if (!grant) {
            return res.status(404).json({ error: 'Project grant not found' });
        }

        // Check if user is authorized (must be the submitter)
        if (grant.submittedBy !== req.user.email) {
            return res.status(403).json({ error: 'Not authorized to upload bill for this grant' });
        }

        // Check if grant is approved and fund is released
        if (grant.status !== 'Approved - Fund Released') {
            return res.status(400).json({ error: 'Bill can only be uploaded after fund is released' });
        }

        // Upload bill to Cloudinary
        let billFileUrl = null;
        let billCloudinaryPublicId = null;

        if (billFileData) {
            try {
                const { uploadToCloudinary } = require('../utils/cloudinary');
                const base64Data = billFileData.replace(/^data:.*;base64,/, '');
                const fileBuffer = Buffer.from(base64Data, 'base64');

                const uploadResult = await uploadToCloudinary(
                    fileBuffer,
                    billFileName || 'bill.pdf',
                    'project-grant-bills'
                );

                billFileUrl = uploadResult.url;
                billCloudinaryPublicId = uploadResult.publicId;
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                return res.status(500).json({ error: 'Failed to upload bill to Cloudinary' });
            }
        }

        // Update grant with bill information
        grant.billUploaded = true;
        grant.billFileUrl = billFileUrl;
        grant.billFileName = billFileName || 'bill.pdf';
        grant.billUploadDate = new Date();
        grant.status = 'Bill Uploaded';

        await grant.save();

        const formattedGrant = await formatEquipmentRequestWithHistory(grant);
        res.json(formattedGrant);
    } catch (error) {
        console.error('Upload bill error:', error);
        res.status(500).json({ error: 'Failed to upload bill' });
    }
}

module.exports = { submitEquipmentRequest, updateEquipmentRequestStatus, fetchMyEquipmentRequests, fetchEquipmentRequestsForApproval, uploadEquipmentBill }