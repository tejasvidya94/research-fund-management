import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaCheck, FaBan, FaHistory, FaDownload, FaArrowRight, FaUndo } from 'react-icons/fa';

const ProjectDetailModal = ({ project, onClose, user, onStatusUpdate, onBudgetUpdated }) => {
    const [comment, setComment] = useState('');
    const [forwardedTo, setForwardedTo] = useState('');

    if (!project) {
        return null;
    }

    // Map user designation to stage for comparison
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
    const userDesignationLower = user?.designation?.toLowerCase();
    const userStage = designationToStage[userDesignationLower] || user?.designation?.toUpperCase();
    const canApprove = user && project.status === 'Pending' && project.currentStage === userStage;
    
    // Only Vice Chancellor can reject/approve (final approval)
    const isViceChancellor = userStage === 'VICE_CHANCELLOR';
    // Registrar can approve projects with budget < 50000
    const isRegistrar = userStage === 'REGISTRAR';
    const canRegistrarApprove = isRegistrar && project.totalBudget && project.totalBudget < 50000;
    // Show forward button for all except VC (Registrar can both approve and forward if budget < 50000)
    const shouldShowForward = !isViceChancellor;
    
    // Check if user can forward to selected stage (R&D_MAIN and FO_MAIN)
    const canSelectForward = (userStage === 'R&D_MAIN' || userStage === 'FINANCE_OFFICER_MAIN');
    
    // Available stages for forwarding (higher authorities)
    const stages = ['HOD', 'DEAN', 'R&D_HELPER', 'R&D_MAIN', 'ACADEMIC_INTEGRITY_OFFICER', 'FINANCE_OFFICER_HELPER', 'FINANCE_OFFICER_MAIN', 'REGISTRAR', 'VC_OFFICE', 'VICE_CHANCELLOR', 'COMPLETED'];
    const currentStageIndex = stages.indexOf(project.currentStage);
    
    // Define allowed forwarding stages based on user role
    let forwardableStages = [];
    if (canSelectForward) {
      if (userStage === 'R&D_MAIN') {
        // R&D_MAIN can forward to: FINANCE_OFFICER_MAIN, REGISTRAR, VC_OFFICE, VICE_CHANCELLOR
        const allowedStages = ['FINANCE_OFFICER_MAIN', 'REGISTRAR', 'VC_OFFICE', 'VICE_CHANCELLOR'];
        forwardableStages = allowedStages.filter(stage => {
          const stageIndex = stages.indexOf(stage);
          return stageIndex > currentStageIndex;
        });
      } else if (userStage === 'FINANCE_OFFICER_MAIN') {
        // FINANCE_OFFICER_MAIN can forward to: REGISTRAR, VC_OFFICE, VICE_CHANCELLOR
        const allowedStages = ['REGISTRAR', 'VC_OFFICE', 'VICE_CHANCELLOR'];
        forwardableStages = allowedStages.filter(stage => {
          const stageIndex = stages.indexOf(stage);
          return stageIndex > currentStageIndex;
        });
      }
    } else {
      // For other users, use default behavior (next stage)
      forwardableStages = stages.slice(currentStageIndex + 1, stages.length - 1); // Exclude COMPLETED
    }

    const handleAction = (status, forceForward = false) => {
        if (onStatusUpdate) {
            // For Registrar with budget < 50000, if forceForward is true, set forwardedTo to next stage
            let finalForwardedTo = forwardedTo;
            if (forceForward && canRegistrarApprove && forwardableStages.length > 0) {
                finalForwardedTo = forwardableStages[0];
            }
            onStatusUpdate(project.id, status, comment, finalForwardedTo);
            setComment('');
            setForwardedTo('');
            onClose();
        }
    };

    const handleDownload = async (documentType = null, index = null) => {
        if (!project.id) {
            alert('No file attached to this project or project ID is missing.');
            return;
        }

        try {
            // First, try to get the URL directly from the project documents
            let fileUrl = null;
            if (documentType === 'completeProposal') {
                fileUrl = project.documents?.completeProposal || project.fileUrl;
            } else if (documentType === 'endorsementLetter') {
                fileUrl = project.documents?.endorsementLetter;
            } else if (documentType === 'piCoPiUndertaking') {
                fileUrl = project.documents?.piCoPiUndertaking;
            } else if (documentType === 'institutionalForwardingLetter') {
                fileUrl = project.documents?.institutionalForwardingLetter;
            } else if (documentType === 'otherSupportingDocs' && index !== null) {
                fileUrl = project.documents?.otherSupportingDocs?.[index];
            } else if (!documentType) {
                // Default to main proposal
                fileUrl = project.documents?.completeProposal || project.fileUrl;
            }

            if (fileUrl) {
                // If we have the URL directly, open it
                window.open(fileUrl, '_blank');
                return;
            }

            // Otherwise, use the API endpoint
            const token = sessionStorage.getItem('token');
            if (!token) {
                alert('No authentication token found. Please log in.');
                return;
            }

            let downloadUrl = `http://localhost:3000/api/projects/download/${project.id}`;
            if (documentType) {
                if (documentType === 'otherSupportingDocs' && index !== null) {
                    downloadUrl += `?documentType=otherSupportingDoc_${index}`;
                } else {
                    downloadUrl += `?documentType=${documentType}`;
                }
            }

            // Create a temporary link to trigger download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', '');
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download file due to a network error.');
        }
    };

    const pendingBudgetRequest = Array.isArray(project.budgetUpdateRequests)
        ? project.budgetUpdateRequests.find(r => r.status === 'Pending')
        : null;

    const handleBudgetDecision = async (action) => {
        if (!pendingBudgetRequest) return;
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                alert('No authentication token found. Please log in.');
                return;
            }

            const extraComment = window.prompt(
                action === 'Approved'
                    ? 'Optional: add a comment for this budget update approval'
                    : 'Provide a reason for rejecting this budget update request (required)',
                ''
            );
            if (action === 'Rejected' && (!extraComment || !extraComment.trim())) {
                alert('Comment is required when rejecting a budget update request.');
                return;
            }

            const res = await fetch('/api/projects/update-budget', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    projectId: project.id,
                    requestId: pendingBudgetRequest._id,
                    action,
                    comment: extraComment || ''
                })
            });

            if (res.ok) {
                const updated = await res.json();
                if (onBudgetUpdated) {
                    onBudgetUpdated(updated);
                }
                alert(
                    action === 'Approved'
                        ? 'Project budget updated successfully.'
                        : 'Budget update request rejected.'
                );
                onClose();
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to process budget update request.');
            }
        } catch (err) {
            console.error('Budget update handling error:', err);
            alert('Failed to process budget update request due to a network error.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-2xl w-full max-w-3xl mx-4 my-8 relative border border-gray-700"
            >
                {/* Modal Header */}
                <div className="flex justify-between items-center border-b border-gray-700 p-5 sticky top-0 bg-gray-900/95 backdrop-blur-sm rounded-t-xl z-10">
                    <h3 className="text-2xl font-semibold text-white">{project.title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <FaTimes className="h-6 w-6" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto bg-gray-900">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
                        <p className="text-gray-300"><strong className="text-white">Project ID:</strong> <span className="text-gray-400">{project.id}</span></p>
                        <p className="text-gray-300"><strong className="text-white">Status:</strong>
                            <span className={`ml-2 px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${
                                project.status === 'Approved' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                                project.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                                project.status === 'Reverted' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' :
                                'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                            }`}>
                                {project.status} ({project.currentStage})
                            </span>
                        </p>
                        <p className="text-gray-300"><strong className="text-white">Principal Investigator:</strong> <span className="text-gray-400">{project.principalInvestigator || project.pi}</span></p>
                        <p className="text-gray-300"><strong className="text-white">PI Designation:</strong> <span className="text-gray-400">{project.piDesignation || 'N/A'}</span></p>
                        <p className="text-gray-300"><strong className="text-white">PI Department:</strong> <span className="text-gray-400">{project.piDepartment || 'N/A'}</span></p>
                        <p className="text-gray-300"><strong className="text-white">Funding Agency:</strong> <span className="text-gray-400">{project.fundingAgency || 'N/A'}</span></p>
                        <p className="text-gray-300"><strong className="text-white">Scheme / Call Ref No:</strong> <span className="text-gray-400">{project.schemeCallRefNo || 'N/A'}</span></p>
                        <p className="text-gray-300"><strong className="text-white">Collaborating Institute:</strong> <span className="text-gray-400">{project.collaboratingInstitute || 'N/A'}</span></p>
                        {project.coPi && project.coPi.length > 0 && (
                            <div className="md:col-span-2">
                                <strong className="text-white">Co-Principal Investigators:</strong>
                                <div className="mt-1 space-y-1">
                                    {project.coPi.map((coPi, idx) => (
                                        <div key={idx} className="text-gray-400 text-sm">
                                            {coPi.name} ({coPi.designation}, {coPi.department})
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <p className="text-gray-300"><strong className="text-white">Project Start Date:</strong> <span className="text-gray-400">{project.projectStartDate ? new Date(project.projectStartDate).toLocaleDateString() : (project.duration ? project.duration.split(' to ')[0] : 'N/A')}</span></p>
                        <p className="text-gray-300"><strong className="text-white">Project End Date:</strong> <span className="text-gray-400">{project.projectEndDate ? new Date(project.projectEndDate).toLocaleDateString() : (project.duration ? project.duration.split(' to ')[1] : 'N/A')}</span></p>
                        <p className="text-gray-300"><strong className="text-white">Duration:</strong> <span className="text-gray-400">{project.duration || 'N/A'}</span></p>
                        <p className="text-gray-300"><strong className="text-white">Total Budget:</strong> <span className="text-gray-400">₹{(project.budget || project.totalBudget || 0).toLocaleString('en-IN')}</span></p>
                        <p className="text-gray-300"><strong className="text-white">Available Budget:</strong> <span className="text-gray-400">₹{(project.availableBudget || 0).toLocaleString('en-IN')}</span></p>
                        <p className="text-gray-300"><strong className="text-white">Funding Agency Format Followed:</strong> <span className="text-gray-400">{project.fundingAgencyFormatFollowed !== undefined ? (project.fundingAgencyFormatFollowed ? 'Yes' : 'No') : 'N/A'}</span></p>
                        <p className="text-gray-300"><strong className="text-white">AI Usage Percentage:</strong> <span className="text-gray-400">{project.aiUsagePercentage !== undefined ? `${project.aiUsagePercentage}%` : 'N/A'}</span></p>
                        <p className="text-gray-300"><strong className="text-white">Plagiarism Percentage:</strong> <span className="text-gray-400">{project.plagiarismPercentage !== undefined ? `${project.plagiarismPercentage}%` : 'N/A'}</span></p>
                    </div>

                    {/* Budget Heads Breakdown */}
                    {project.budgetHeads && (
                        <div className="border-t border-gray-700 pt-4">
                            <h4 className="font-semibold text-white mb-3">Budget Heads Breakdown</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                {Object.entries(project.budgetHeads).map(([head, amount]) => (
                                    <div key={head} className="bg-gray-800/50 p-3 rounded-lg">
                                        <div className="text-gray-400 capitalize">{head}:</div>
                                        <div className="text-white font-semibold">₹{amount.toLocaleString('en-IN')}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Documents Section */}
                    <div className="border-t border-gray-700 pt-4">
                        <h4 className="font-semibold text-white mb-3">Attached Documents</h4>
                        <div className="space-y-3">
                            {/* Complete Proposal (Required) - Check both documents.completeProposal and legacy fileUrl */}
                            {((project.documents && project.documents.completeProposal) || project.fileUrl) && (
                                <div className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/50">
                                            <FaDownload className="text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Complete Proposal</p>
                                            <p className="text-xs text-gray-400">Required Document</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDownload('completeProposal')}
                                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                    >
                                        <FaDownload className="h-4 w-4" />
                                        Download
                                    </button>
                                </div>
                            )}

                            {/* PI/Co-PI Undertaking (Required) */}
                            {project.documents?.piCoPiUndertaking && (
                                <div className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/50">
                                            <FaDownload className="text-green-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">PI/Co-PI Undertaking</p>
                                            <p className="text-xs text-gray-400">Required Document</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDownload('piCoPiUndertaking')}
                                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                                    >
                                        <FaDownload className="h-4 w-4" />
                                        Download
                                    </button>
                                </div>
                            )}

                            {/* Endorsement Letter (Optional) */}
                            {project.documents?.endorsementLetter && (
                                <div className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center border border-yellow-500/50">
                                            <FaDownload className="text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Endorsement Letter</p>
                                            <p className="text-xs text-gray-400">Optional Document</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDownload('endorsementLetter')}
                                        className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
                                    >
                                        <FaDownload className="h-4 w-4" />
                                        Download
                                    </button>
                                </div>
                            )}

                            {/* Institutional Forwarding Letter (Optional) */}
                            {project.documents?.institutionalForwardingLetter && (
                                <div className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/50">
                                            <FaDownload className="text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Institutional Forwarding Letter</p>
                                            <p className="text-xs text-gray-400">Optional Document</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDownload('institutionalForwardingLetter')}
                                        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                                    >
                                        <FaDownload className="h-4 w-4" />
                                        Download
                                    </button>
                                </div>
                            )}

                            {/* Other Supporting Documents (Optional) */}
                            {project.documents?.otherSupportingDocs && project.documents.otherSupportingDocs.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-300 mb-2">Other Supporting Documents (Optional):</p>
                                    {project.documents.otherSupportingDocs.map((docUrl, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center border border-indigo-500/50">
                                                    <FaDownload className="text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">Supporting Document {index + 1}</p>
                                                    <p className="text-xs text-gray-400">Optional Document</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDownload('otherSupportingDocs', index)}
                                                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                                            >
                                                <FaDownload className="h-4 w-4" />
                                                Download
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Show message if no documents found */}
                            {!project.documents?.completeProposal && !project.fileUrl && !project.documents?.piCoPiUndertaking && !project.documents?.endorsementLetter && !project.documents?.institutionalForwardingLetter && (!project.documents?.otherSupportingDocs || project.documents.otherSupportingDocs.length === 0) && (
                                <p className="text-gray-400 text-sm italic">No documents attached to this project.</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white">Project Summary:</h4>
                        <p className="text-gray-400 mt-1 text-sm md:text-base leading-relaxed">
                            {project.summary || 'No summary provided.'}
                        </p>
                    </div>

                    {/* Budget Update Requests */}
                    {project.budgetUpdateRequests && project.budgetUpdateRequests.length > 0 && (
                        <div className="border-t border-gray-700 pt-4">
                            <h4 className="font-semibold text-white mb-3">Budget Update Requests</h4>
                            <div className="space-y-3 text-sm">
                                {project.budgetUpdateRequests.map((req, idx) => (
                                    <div
                                        key={req._id || idx}
                                        className="bg-gray-800/50 p-3 rounded-md border border-gray-700"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-gray-300">
                                                From ₹{(req.oldTotalBudget || 0).toLocaleString('en-IN')} to ₹
                                                {(req.requestedTotalBudget || 0).toLocaleString('en-IN')}
                                            </span>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    req.status === 'Pending'
                                                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                                                        : req.status === 'Approved'
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                                        : 'bg-red-500/20 text-red-400 border border-red-500/50'
                                                }`}
                                            >
                                                {req.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-400">
                                            <strong>Reason:</strong> {req.reason}
                                        </p>
                                        <p className="text-gray-500 text-xs mt-1">
                                            Requested by {req.requestedByName} ({req.requestedBy}) on{' '}
                                            {req.requestedAt
                                                ? new Date(req.requestedAt).toLocaleDateString()
                                                : 'N/A'}
                                        </p>
                                        {req.supportingDocs && req.supportingDocs.length > 0 && (
                                            <div className="text-xs text-gray-400 mt-1">
                                                Supporting documents:
                                                <ul className="list-disc list-inside">
                                                    {req.supportingDocs.map((url, i) => (
                                                        <li key={i}>
                                                            <a
                                                                href={url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-400 hover:underline"
                                                            >
                                                                Document {i + 1}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {req.status !== 'Pending' && (
                                            <p className="text-gray-500 text-xs mt-1">
                                                Decision: {req.status} by {req.decidedBy || 'N/A'} (
                                                {req.decidedByEmail || 'N/A'}) on{' '}
                                                {req.decidedAt
                                                    ? new Date(req.decidedAt).toLocaleDateString()
                                                    : 'N/A'}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Approval History */}
                    <div className="border-t border-gray-700 pt-4">
                        <h4 className="font-semibold text-white flex items-center gap-2 mb-3">
                            <FaHistory /> Approval History
                        </h4>
                        <div className="space-y-4">
                            {!project.approvalHistory || project.approvalHistory.length === 0 ? (
                                <p className="text-gray-400 italic text-sm">No history yet.</p>
                            ) : (
                                project.approvalHistory.map((history, index) => (
                                    <div key={index} className="flex items-start gap-3 bg-gray-800/50 p-3 rounded-md border border-gray-700">
                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                            history.status === 'Approved' ? 'bg-green-500' : 
                                            history.status === 'Rejected' ? 'bg-red-500' : 
                                            'bg-orange-500'
                                        }`} />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <span className="font-medium text-white">{history.stage} ({history.user})</span>
                                                <span className="text-xs text-gray-400">{history.date}</span>
                                            </div>
                                            <p className="text-sm text-gray-300 mt-1">
                                                <span className={`font-semibold ${
                                                    history.status === 'Approved' ? 'text-green-400' : 
                                                    history.status === 'Rejected' ? 'text-red-400' : 
                                                    'text-orange-400'
                                                }`}>{history.status}</span>
                                                {history.comment && `: ${history.comment}`}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Action Section for Approvers */}
                    {canApprove && (
                        <div className="border-t border-gray-700 pt-4 bg-blue-500/10 -mx-6 px-6 py-4 mt-4 border-l-4 border-blue-500">
                            <h4 className="font-semibold text-white mb-2">Review Action</h4>
                            
                            {/* Forward selection for R&D_MAIN and FO_MAIN */}
                            {canSelectForward && (
                                <div className="mb-3">
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Forward to (Select higher authority):
                                    </label>
                                    <select
                                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                                        value={forwardedTo}
                                        onChange={(e) => setForwardedTo(e.target.value)}
                                    >
                                        <option value="">Select stage (optional - defaults to next stage)</option>
                                        {forwardableStages.map(stage => (
                                            <option key={stage} value={stage}>{stage}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            
                            <textarea
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none mb-3 text-white placeholder-gray-500"
                                rows="3"
                                placeholder={shouldShowForward
                                    ? "Add a comment (optional for forwarding, required for revert/rejection)..."
                                    : "Add a comment (optional for approval, required for revert/rejection)..."}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                            <div className="flex gap-3 flex-wrap">
                                {/* Registrar with budget < 50000: Show both Approve and Forward */}
                                {canRegistrarApprove ? (
                                    <>
                                        <button
                                            onClick={() => handleAction('Approved', false)}
                                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                                        >
                                            <FaCheck /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction('Approved', true)}
                                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                                        >
                                            <FaArrowRight /> Forward
                                        </button>
                                        <button
                                            onClick={() => handleAction('Reverted')}
                                            disabled={!comment.trim()}
                                            title={!comment.trim() ? "Comment required for revert" : ""}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                                                !comment.trim() 
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                                : 'bg-orange-600 text-white hover:bg-orange-700'
                                            }`}
                                        >
                                            <FaUndo /> Revert with Suggestions
                                        </button>
                                    </>
                                ) : shouldShowForward ? (
                                    <>
                                        <button
                                            onClick={() => handleAction('Approved')}
                                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                                        >
                                            <FaArrowRight /> Forward
                                        </button>
                                        <button
                                            onClick={() => handleAction('Reverted')}
                                            disabled={!comment.trim()}
                                            title={!comment.trim() ? "Comment required for revert" : ""}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                                                !comment.trim() 
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                                : 'bg-orange-600 text-white hover:bg-orange-700'
                                            }`}
                                        >
                                            <FaUndo /> Revert with Suggestions
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleAction('Approved')}
                                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                                        >
                                            <FaCheck /> Approve
                                        </button>
                                        {isViceChancellor ? (
                                            <button
                                                onClick={() => handleAction('Rejected')}
                                                disabled={!comment.trim()}
                                                title={!comment.trim() ? "Comment required for rejection" : ""}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                                                    !comment.trim() 
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                                    : 'bg-red-600 text-white hover:bg-red-700'
                                                }`}
                                            >
                                                <FaBan /> Reject
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleAction('Reverted')}
                                                disabled={!comment.trim()}
                                                title={!comment.trim() ? "Comment required for revert" : ""}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                                                    !comment.trim() 
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                                    : 'bg-orange-600 text-white hover:bg-orange-700'
                                                }`}
                                            >
                                                <FaUndo /> Revert with Suggestions
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* R&D Main Budget Update Actions (outside main approval flow) */}
                    {userStage === 'R&D_MAIN' &&
                        project.status === 'Approved' &&
                        pendingBudgetRequest && (
                            <div className="border-t border-gray-700 pt-4 bg-purple-500/10 -mx-6 px-6 py-4 mt-4 border-l-4 border-purple-500">
                                <h4 className="font-semibold text-white mb-2">Budget Update Request</h4>
                                <p className="text-gray-300 text-sm mb-3">
                                    Requested change from{' '}
                                    <strong>
                                        ₹{(pendingBudgetRequest.oldTotalBudget || 0).toLocaleString('en-IN')}
                                    </strong>{' '}
                                    to{' '}
                                    <strong>
                                        ₹
                                        {(
                                            pendingBudgetRequest.requestedTotalBudget || 0
                                        ).toLocaleString('en-IN')}
                                    </strong>
                                    .
                                </p>
                                <div className="flex gap-3 flex-wrap">
                                    <button
                                        onClick={() => handleBudgetDecision('Approved')}
                                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                                    >
                                        <FaCheck /> Approve Budget Update
                                    </button>
                                    <button
                                        onClick={() => handleBudgetDecision('Rejected')}
                                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                                    >
                                        <FaBan /> Reject Budget Update
                                    </button>
                                </div>
                            </div>
                        )}
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-700 p-5 text-right bg-gray-900/95 backdrop-blur-sm rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="bg-gray-700 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-600 transition duration-200"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ProjectDetailModal;