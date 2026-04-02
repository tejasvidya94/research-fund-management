import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function ProjectAccountForm({ approvedProjects, onSubmit, onCancel }) {
  const [budgetRows, setBudgetRows] = useState([{
    budgetHead: '',
    balanceAsPerUC: 0,
    expenditure: 0,
    currentBalance: 0,
    newGrantAllocation: 0,
    totalBalance: 0
  }]);

  const budgetHeads = ['Equipment', 'Manpower', 'Consumables', 'Travel', 'Contingency', 'Overhead', 'Others'];

  const calculateCurrentBalance = (row) => {
    return row.balanceAsPerUC - row.expenditure;
  };

  const calculateTotalBalance = (row) => {
    return row.currentBalance + row.newGrantAllocation;
  };

  const updateBudgetRow = (index, field, value) => {
    const newRows = [...budgetRows];
    newRows[index][field] = field === 'budgetHead' ? value : parseFloat(value) || 0;
    
    // Auto-calculate current balance
    newRows[index].currentBalance = calculateCurrentBalance(newRows[index]);
    // Auto-calculate total balance
    newRows[index].totalBalance = calculateTotalBalance(newRows[index]);
    
    setBudgetRows(newRows);
  };

  const addBudgetRow = () => {
    setBudgetRows([...budgetRows, {
      budgetHead: '',
      balanceAsPerUC: 0,
      expenditure: 0,
      currentBalance: 0,
      newGrantAllocation: 0,
      totalBalance: 0
    }]);
  };

  const removeBudgetRow = (index) => {
    setBudgetRows(budgetRows.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onSubmit(formData, budgetRows);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto my-8">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-lg z-10">
          <h3 className="text-2xl font-bold">Project Account Opening & Budget Bifurcation</h3>
          <p className="text-purple-100 mt-1">Module 2: Account Opening Form</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* SECTION A: PROJECT INFO */}
          <div className="border-b border-gray-300 pb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">SECTION A: Project Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Project *</label>
                <select
                  name="projectId"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Choose a project...</option>
                  {approvedProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.id} - {project.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sanction Letter No *</label>
                <input
                  type="text"
                  name="sanctionLetterNo"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sanction Date *</label>
                <input
                  type="date"
                  name="sanctionDate"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Funding Scheme Name</label>
                <input
                  type="text"
                  name="fundingSchemeName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Start Date *</label>
                <input
                  type="date"
                  name="projectStartDate"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project End Date *</label>
                <input
                  type="date"
                  name="projectEndDate"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Project Cost (₹) *</label>
                <input
                  type="number"
                  name="totalProjectCost"
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Installment Number *</label>
                <select
                  name="installmentNumber"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Installment</option>
                  <option value="1">1st Installment</option>
                  <option value="2">2nd Installment</option>
                  <option value="3">3rd Installment</option>
                  <option value="4">4th Installment</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="firstInstallmentReceived"
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">First Installment Received</span>
                </label>
              </div>
            </div>
          </div>

          {/* SECTION B: BUDGET UTILIZATION TABLE */}
          <div className="border-b border-gray-300 pb-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">SECTION B: Budget Utilization Table</h4>
              <button
                type="button"
                onClick={addBudgetRow}
                className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Row
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Budget Head</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Balance as per UC</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Expenditure</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Current Balance (Auto)</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">New Grant Allocation</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Total Balance (Auto)</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetRows.map((row, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-2 py-2">
                        <select
                          value={row.budgetHead}
                          onChange={(e) => updateBudgetRow(index, 'budgetHead', e.target.value)}
                          required
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select</option>
                          {budgetHeads.map(head => (
                            <option key={head} value={head}>{head}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.balanceAsPerUC}
                          onChange={(e) => updateBudgetRow(index, 'balanceAsPerUC', e.target.value)}
                          required
                          min="0"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.expenditure}
                          onChange={(e) => updateBudgetRow(index, 'expenditure', e.target.value)}
                          required
                          min="0"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.currentBalance.toFixed(2)}
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.newGrantAllocation}
                          onChange={(e) => updateBudgetRow(index, 'newGrantAllocation', e.target.value)}
                          required
                          min="0"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.totalBalance.toFixed(2)}
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100 font-semibold"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        {budgetRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBudgetRow(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION C: FUND RECEIPT DETAILS */}
          <div className="border-b border-gray-300 pb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">SECTION C: Fund Receipt Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mode of Transfer *</label>
                <select
                  name="modeOfTransfer"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Mode</option>
                  <option value="NEFT">NEFT</option>
                  <option value="RTGS">RTGS</option>
                  <option value="IMPS">IMPS</option>
                  <option value="Cheque">Cheque</option>
                  <option value="DD">DD</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UTR Number *</label>
                <input
                  type="text"
                  name="utrNumber"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter UTR Number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Credit *</label>
                <input
                  type="date"
                  name="dateOfCredit"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Received (₹) *</label>
                <input
                  type="number"
                  name="amountReceived"
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
            >
              Submit Account Opening Form
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

