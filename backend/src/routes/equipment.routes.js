const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { submitEquipmentRequest, updateEquipmentStatus, getMyEquipmentRequests, getEquipmentRequestsForApproval, uploadEquipmentBill } = require('../controllers/equipment.controller');

const router = express.Router();



// Submit project grant (Module 3: Indent for Project Grant)-
// create new equipment request (Done by PI)
router.post('/submit', authMiddleware, submitEquipmentRequest);

// Update resource allotment request status (approve/reject/revert)
router.post('/update-status', authMiddleware, updateEquipmentStatus);

// Get resource allotment requests for the logged-in user ( PI )
router.get('/my-requests', authMiddleware, getMyEquipmentRequests);

// Get resource allotment requests for approval (for HOD, Dean, etc.)
router.get('/for-approval', authMiddleware, getEquipmentRequestsForApproval);


// Upload bill after equipment purchase (proof of work)
router.post('/upload-bill', authMiddleware, uploadEquipmentBill);

module.exports = router;
