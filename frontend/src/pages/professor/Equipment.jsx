import React from 'react';
import { Package, DollarSign } from 'lucide-react';
import { getStatusColor, getStatusIcon } from '../../utils/storage';

export default function Equipment({ equipmentRequests, approvedProjects, onNewRequest }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={onNewRequest}
          disabled={approvedProjects.length === 0}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
        >
          <DollarSign className="w-4 h-4" />
          New Resource Allotment Request
        </button>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-6">Resource Allotment</h3>

        {equipmentRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p>No resource allotment requests submitted yet</p>
            {approvedProjects.length > 0 && (
              <button
                onClick={onNewRequest}
                className="mt-4 text-blue-400 hover:text-blue-300 font-medium"
              >
                Submit your first resource allotment request
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {equipmentRequests.map(request => (
              <div key={request.id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 hover:bg-gray-900/70 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white">{request.equipmentName}</h4>
                    <p className="text-gray-400 text-sm mt-1">Project: {request.projectTitle}</p>
                    <p className="text-gray-500 text-sm">{request.id}</p>
                  </div>
                  <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    {request.status}
                    {request.currentStage && request.status === 'Pending' && ` (${request.currentStage})`}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4 p-4 bg-gray-800/50 rounded-lg">
                  <div>
                    <span className="text-sm text-gray-500">Quantity</span>
                    <div className="font-semibold text-gray-200">{request.quantity}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Unit Price</span>
                    <div className="font-semibold text-gray-200">₹{(request.unitPrice || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Total Amount</span>
                    <div className="font-semibold text-green-400">₹{(request.totalAmount || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Request Date</span>
                    <div className="font-semibold text-gray-200">
                      {request.submittedDate ? new Date(request.submittedDate).toLocaleDateString()
                        :
                        'N/A'}
                    </div>
                  </div>
                </div>

                {request.justification && (
                  <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                    <span className="text-sm font-medium text-blue-400">Justification:</span>
                    <p className="text-gray-300 mt-1">{request.justification}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}