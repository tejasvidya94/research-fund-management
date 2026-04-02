const mongoose = require('mongoose');

// Project Account Schema (Module 2: Project Account Opening & Budget Bifurcation)
const projectAccountSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  projectId: {
    type: String,
    required: true,
    ref: 'Project'
  },
  projectTitle: {
    type: String,
    required: true
  },
  // SECTION A: PROJECT INFO
  sanctionLetterNo: {
    type: String,
    required: true,
    trim: true
  },
  sanctionDate: {
    type: Date,
    required: true
  },
  fundingSchemeName: {
    type: String,
    trim: true
  },
  projectStartDate: {
    type: Date,
    required: true
  },
  projectEndDate: {
    type: Date,
    required: true
  },
  totalProjectCost: {
    type: Number,
    required: true,
    min: 0
  },
  installmentNumber: {
    type: Number,
    required: true,
    min: 1
  },
  firstInstallmentReceived: {
    type: Boolean,
    default: false
  },
  // SECTION B: BUDGET UTILIZATION TABLE
  budgetUtilization: [{
    budgetHead: {
      type: String,
      required: true,
      enum: ['Equipment', 'Manpower', 'Consumables', 'Travel', 'Contingency', 'Overhead', 'Others']
    },
    balanceAsPerUC: {
      type: Number,
      required: true,
      min: 0
    },
    expenditure: {
      type: Number,
      required: true,
      min: 0
    },
    currentBalance: {
      type: Number,
      required: true,
      min: 0
    },
    newGrantAllocation: {
      type: Number,
      required: true,
      min: 0
    },
    totalBalance: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  // SECTION C: FUND RECEIPT DETAILS
  fundReceipt: {
    modeOfTransfer: {
      type: String,
      required: true,
      enum: ['NEFT', 'RTGS', 'IMPS', 'Cheque', 'DD', 'Other']
    },
    utrNumber: {
      type: String,
      required: true,
      trim: true
    },
    dateOfCredit: {
      type: Date,
      required: true
    },
    amountReceived: {
      type: Number,
      required: true,
      min: 0
    }
  },
  submittedBy: {
    type: String,
    required: true,
    ref: 'User'
  },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Approved', 'Rejected', 'Reverted']
  },
  currentStage: {
    type: String,
    default: 'HOD',
    enum: ['HOD', 'DEAN', 'R&D_HELPER', 'R&D_MAIN', 'ACADEMIC_INTEGRITY_OFFICER', 'FINANCE_OFFICER_HELPER', 
           'FINANCE_OFFICER_MAIN', 'REGISTRAR', 'VC_OFFICE', 'VICE_CHANCELLOR', 'COMPLETED']
  },
  forwardedTo: {
    type: String,
    default: null
  }
}, {
  timestamps: { createdAt: 'submittedDate', updatedAt: false }
});

module.exports = mongoose.model('ProjectAccount', projectAccountSchema);

