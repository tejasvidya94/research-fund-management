import React, { useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';

export default function ProjectGrantForm({ approvedProjects, onSubmit, onCancel }) {
  const [items, setItems] = useState([{
    itemName: '',
    description: '',
    catalogNo: '',
    make: '',
    quantity: 1,
    rate: 0,
    discountPercent: 0,
    gstPercent: 0,
    totalPrice: 0,
    stockAvailable: false,
    location: 'PI Lab'
  }]);
  const [enclosureFiles, setEnclosureFiles] = useState({});

  const calculateItemTotal = (item) => {
    const subtotal = item.quantity * item.rate;
    const discount = subtotal * (item.discountPercent / 100);
    const afterDiscount = subtotal - discount;
    const gst = afterDiscount * (item.gstPercent / 100);
    return afterDiscount + gst;
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'stockAvailable' ? value === 'true' : 
                             field === 'quantity' || field === 'rate' || field === 'discountPercent' || field === 'gstPercent' ? 
                             parseFloat(value) || 0 : value;
    
    // Recalculate total price
    newItems[index].totalPrice = calculateItemTotal(newItems[index]);
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      itemName: '',
      description: '',
      catalogNo: '',
      make: '',
      quantity: 1,
      rate: 0,
      discountPercent: 0,
      gstPercent: 0,
      totalPrice: 0,
      stockAvailable: false,
      location: 'PI Lab'
    }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleEnclosureChange = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size should not exceed 10MB');
        e.target.value = '';
        return;
      }
      setEnclosureFiles({ ...enclosureFiles, [field]: file });
    }
  };

  const convertFileToBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Convert enclosure files to base64
    const enclosureData = {};
    for (const [key, file] of Object.entries(enclosureFiles)) {
      if (file) {
        try {
          enclosureData[key] = await convertFileToBase64(file);
        } catch (error) {
          console.error(`Error reading file ${key}:`, error);
          alert(`Failed to read file: ${key}`);
          return;
        }
      }
    }

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    onSubmit(formData, items, enclosureData, totalAmount);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto my-8">
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-lg z-10">
          <h3 className="text-2xl font-bold">Indent for Project Grant (Form PC)</h3>
          <p className="text-green-100 mt-1">Module 3: Project Grant Request</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* SECTION A: GRANT TYPE */}
          <div className="border-b border-gray-300 pb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">SECTION A: Grant Type</h4>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input type="radio" name="grantType" value="Non-Recurring" required className="w-4 h-4" />
                <span>Non-Recurring</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="grantType" value="Recurring" required className="w-4 h-4" />
                <span>Recurring</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="grantType" value="Overhead" required className="w-4 h-4" />
                <span>Overhead</span>
              </label>
            </div>
          </div>

          {/* SECTION B: PROCUREMENT DETAILS */}
          <div className="border-b border-gray-300 pb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">SECTION B: Procurement Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Project *</label>
                <select
                  name="projectId"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Choose a project...</option>
                  {approvedProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.id} - {project.title} (Available: ₹{project.availableBudget?.toLocaleString() || 0})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Head *</label>
                <select
                  name="budgetHead"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Budget Head</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Manpower">Manpower</option>
                  <option value="Consumables">Consumables</option>
                  <option value="Travel">Travel</option>
                  <option value="Contingency">Contingency</option>
                  <option value="Overhead">Overhead</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Sanctioned (₹) *</label>
                <input
                  type="number"
                  name="amountSanctioned"
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Balance (₹) *</label>
                <input
                  type="number"
                  name="availableBalance"
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Procurement Mode *</label>
                <select
                  name="procurementMode"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Procurement Mode</option>
                  <option value="GeM">GeM</option>
                  <option value="E-Portal">E-Portal</option>
                  <option value="RC">RC</option>
                  <option value="Tender">Tender</option>
                  <option value="Purchase Committee">Purchase Committee</option>
                  <option value="Single Quotation">Single Quotation</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION C: ITEM DETAILS */}
          <div className="border-b border-gray-300 pb-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">SECTION C: Item Details</h4>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium text-gray-700">Item {index + 1}</h5>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Catalog No</label>
                      <input
                        type="text"
                        value={item.catalogNo}
                        onChange={(e) => updateItem(index, 'catalogNo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                      <input
                        type="text"
                        value={item.make}
                        onChange={(e) => updateItem(index, 'make', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹) *</label>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', e.target.value)}
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                      <input
                        type="number"
                        value={item.discountPercent}
                        onChange={(e) => updateItem(index, 'discountPercent', e.target.value)}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GST (%)</label>
                      <input
                        type="number"
                        value={item.gstPercent}
                        onChange={(e) => updateItem(index, 'gstPercent', e.target.value)}
                        min="0"
                        max="28"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Available</label>
                      <select
                        value={item.stockAvailable}
                        onChange={(e) => updateItem(index, 'stockAvailable', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <select
                        value={item.location}
                        onChange={(e) => updateItem(index, 'location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="PI Lab">PI Lab</option>
                        <option value="Dept">Dept</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Price (₹)</label>
                      <input
                        type="number"
                        value={item.totalPrice.toFixed(2)}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 font-semibold"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Grand Total:</span>
                  <span className="text-xl font-bold text-green-600">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION D: ENCLOSURES */}
          <div className="border-b border-gray-300 pb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">SECTION D: Enclosures</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Draft PO</label>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => handleEnclosureChange('draftPO', e)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {enclosureFiles.draftPO && (
                  <p className="text-xs text-gray-600 mt-1">{enclosureFiles.draftPO.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GeM Non-Availability</label>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => handleEnclosureChange('gemNonAvailability', e)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {enclosureFiles.gemNonAvailability && (
                  <p className="text-xs text-gray-600 mt-1">{enclosureFiles.gemNonAvailability.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dept Non-Availability</label>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => handleEnclosureChange('deptNonAvailability', e)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {enclosureFiles.deptNonAvailability && (
                  <p className="text-xs text-gray-600 mt-1">{enclosureFiles.deptNonAvailability.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sanction Letter</label>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => handleEnclosureChange('sanctionLetter', e)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {enclosureFiles.sanctionLetter && (
                  <p className="text-xs text-gray-600 mt-1">{enclosureFiles.sanctionLetter.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rate Contract NA Certificate</label>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => handleEnclosureChange('rateContractNACertificate', e)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {enclosureFiles.rateContractNACertificate && (
                  <p className="text-xs text-gray-600 mt-1">{enclosureFiles.rateContractNACertificate.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quotation Proof</label>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => handleEnclosureChange('quotationProof', e)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {enclosureFiles.quotationProof && (
                  <p className="text-xs text-gray-600 mt-1">{enclosureFiles.quotationProof.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Proof</label>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => handleEnclosureChange('equipmentProof', e)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {enclosureFiles.equipmentProof && (
                  <p className="text-xs text-gray-600 mt-1">{enclosureFiles.equipmentProof.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conference Invite</label>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => handleEnclosureChange('conferenceInvite', e)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {enclosureFiles.conferenceInvite && (
                  <p className="text-xs text-gray-600 mt-1">{enclosureFiles.conferenceInvite.name}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Max file size: 10MB per file</p>
          </div>

          {/* SECTION E: REQUEST TYPE */}
          <div className="border-b border-gray-300 pb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">SECTION E: Request Type</h4>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input type="radio" name="requestType" value="Advance" required className="w-4 h-4" />
                <span>Advance</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="requestType" value="Reimbursement" required className="w-4 h-4" />
                <span>Reimbursement</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Note: Reimbursement is only allowed for amounts ≤ ₹5000 (Contingency/Travel only)
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md"
            >
              Submit Project Grant Request
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

