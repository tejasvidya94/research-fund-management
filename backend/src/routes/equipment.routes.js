const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { submitEquipmentRequest, updateEquipmentRequestStatus, fetchMyEquipmentRequests, fetchEquipmentRequestsForApproval, uploadEquipmentBill } = require('../controllers/equipment.controller');

const router = express.Router();



// Submit project grant (Module 3: Indent for Project Grant)-
// create new equipment request (Done by PI)
router.post('/submit', authMiddleware, submitEquipmentRequest);

// Update resource allotment request status (approve/reject/revert)
router.post('/update-status', authMiddleware, updateEquipmentRequestStatus);

// Get resource allotment requests for the logged-in user ( PI )
router.get('/my-requests', authMiddleware, fetchMyEquipmentRequests);

// Get resource allotment requests for approval (for HOD, Dean, etc.)
router.get('/for-approval', authMiddleware, fetchEquipmentRequestsForApproval);


// Upload bill after equipment purchase (proof of work)
router.post('/upload-bill', authMiddleware, uploadEquipmentBill);

module.exports = router;
