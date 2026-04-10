const EquipmentApprovalHistory = require("../models/EquipmentApprovalHistory");
// Helper function to format project grant with history
const formatEquipmentRequestWithHistory = async (request) => {
    const history = await EquipmentApprovalHistory.find({ equipmentRequestId: request.id })
        .sort({ actionDate: 1 });

    return {
        id: request.id,
        projectId: request.projectId,
        projectTitle: request.projectTitle,
        // For backward‑compatible UI fields
        equipmentName: request.items?.[0]?.itemName || `${request.grantType} Project Grant`,
        quantity: request.items?.[0]?.quantity || null,
        unitPrice: request.items?.[0]?.rate || null,
        totalAmount: request.totalAmount,
        // Expose full grant details for new UI
        grantType: request.grantType,
        budgetHead: request.budgetHead,
        amountSanctioned: request.amountSanctioned,
        availableBalance: request.availableBalance,
        procurementMode: request.procurementMode,
        items: request.items,
        enclosures: request.enclosures,
        requestType: request.requestType,
        billUploaded: request.billUploaded,
        billFileUrl: request.billFileUrl,
        billFileName: request.billFileName,
        billUploadDate: request.billUploadDate,
        submittedBy: request.submittedBy,
        submittedDate: request.submittedDate,
        status: request.status,
        currentStage: request.currentStage,
        forwardedTo: request.forwardedTo,
        approvalHistory: history.map(h => ({
            stage: h.stage,
            status: h.status,
            user: h.userName,
            date: h.actionDate.toISOString().split('T')[0],
            comment: h.comment
        }))
    };
}

module.exports = { formatEquipmentRequestWithHistory }