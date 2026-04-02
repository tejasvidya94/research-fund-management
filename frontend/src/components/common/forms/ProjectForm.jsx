import React, { useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { uploadToCloudinary } from '../../../utils/cloudinary';
export default function ProjectForm({ user, onSubmit, onCancel, project = null }) {
  // initialise or set coPis state
  // create new empty copi field with objects in the form
  const [coPis, setCoPis] = useState(
    project?.coPi && project.coPi.length > 0
      ? project.coPi
      : [{ name: '', designation: '', department: '' }]
  );

  // add new empty copi field
  const addCoPi = () => {
    if (coPis.length < 2) {
      setCoPis([...coPis, { name: '', designation: '', department: '' }]);
    }
  };

  // remove copi field
  const removeCoPi = (index) => {
    setCoPis(coPis.filter((_, i) => i !== index));
  };
  // fill or update coPi fields
  // fill the values in the added empty fields or update it.
  const updateCoPi = (index, field, value) => {
    const newCoPis = [...coPis];
    newCoPis[index][field] = value;
    setCoPis(newCoPis);
  };

  // initialise budgetHead state
  const [budgetHeads, setBudgetHeads] = useState(() => {
    if (project?.budgetHeads) {
      return {
        equipment: project.budgetHeads.equipment || 0,
        manpower: project.budgetHeads.manpower || 0,
        consumables: project.budgetHeads.consumables || 0,
        travel: project.budgetHeads.travel || 0,
        contingency: project.budgetHeads.contingency || 0,
        overhead: project.budgetHeads.overhead || 0,
        others: project.budgetHeads.others || 0
      };
    }
    return {
      equipment: 0,
      manpower: 0,
      consumables: 0,
      travel: 0,
      contingency: 0,
      overhead: 0,
      others: 0
    };
  });

  //handle change in budget head
  const handleBudgetChange = (head, value) => {
    setBudgetHeads(prev => ({
      ...prev,
      [head]: parseFloat(value) || 0
    }));
  };

  // initialise useState for files
  // we have to handle existing files. Hence current initialization code is incomplete.
  const [files, setFiles] = useState(() => ({
    completeProposal: {
      file: null,
      url: project?.documents?.completeProposal || null
    },
    endorsementLetter: {
      file: null,
      url: project?.documents?.endorsementLetter || null
    },
    piCoPiUndertaking: {
      file: null,
      url: project?.documents?.piCoPiUndertaking || null
    },
    otherSupportingDocs: (project?.documents?.otherSupportingDocs || []).map((url) => ({
      file: null,
      url
    }))
  }));

  // handle file selection and updation here.
  const handleFileChange = (field, e) => {
    const selectedFiles = Array.from(e.target.files);

    const MAX_SIZE = 10 * 1024 * 1024;
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const validFiles = selectedFiles.filter(file => {
      if (file.size > MAX_SIZE) {
        // alert(`${file.name} exceeds 10MB`);
        console.warn(`${file.name} exceeds 10MB`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        // alert(`${file.name} is not a valid file type`);
        console.warn(`${file.name} is not a valid file type`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // const validFiles = selectedFiles; // assume validated
    setFiles(prev => {
      if (field === "otherSupportingDocs") {
        return {
          ...prev,
          otherSupportingDocs: [
            ...prev.otherSupportingDocs,
            ...validFiles.map(file => ({
              file,
              url: null
            }))
          ]
        };
      }
      else {
        return {
          ...prev,
          [field]: {
            file: validFiles[0],
            url: null
          }
        };
      }
    });

    // below line suppor to choose duplicate file ?
    e.target.value = '';
  };

  // handle removal of otherSupportingfiles from choosen files.
  const removeOtherDoc = (index) => {
    setFiles(prev => ({
      ...prev,
      otherSupportingDocs: prev.otherSupportingDocs.filter((_, i) => i !== index)
    }));
  };

  const processFile = async (fileObj) => {
    if (fileObj.file) return await uploadToCloudinary(fileObj.file)
    if (fileObj.url) return fileObj.url;
    return null;
  }

  const handleSubmit = async (e) => {
    console.log("Form submitted");
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.target);
    const filteredCoPis = coPis.filter(cp => cp.name.trim() !== '');

    const documents = {};
    try {
      if (files.completeProposal.file || files.completeProposal.url) {
        documents.completeProposal = await processFile(files.completeProposal);
      }

      if (files.endorsementLetter.file || files.endorsementLetter.url) {
        documents.endorsementLetter = await processFile(files.endorsementLetter);
      }

      if (files.piCoPiUndertaking.file || files.piCoPiUndertaking.url) {
        documents.piCoPiUndertaking = await processFile(files.piCoPiUndertaking);
      }

      documents.otherSupportingDocs = await Promise.all(
        files.otherSupportingDocs.map(processFile)
      );
    } catch (error) {
      alert("File upload failed");
      setUploading(false);
      return;
    }

    onSubmit(formData, filteredCoPis, budgetHeads, documents, project?.id);

    if (!project) {
      setCoPis([{ name: '', designation: '', department: '' }]);
      setFiles({
        completeProposal: { file: null, url: null },
        endorsementLetter: { file: null, url: null },
        piCoPiUndertaking: { file: null, url: null },
        otherSupportingDocs: []
      })
    }
    setUploading(false);
  };

  //initialise uploading state
  const [uploading, setUploading] = useState(false);

  // const handleBudgetChange = (head, value) => {
  //   setBudgetHeads({ ...budgetHeads, [head]: parseFloat(value) || 0 });
  // };



  // setBudgetHeads(prev => ({
  //   ...prev,
  //   [head]: parseFloat(value) || 0
  // }));

  const calculateTotal = () => {
    return Object.values(budgetHeads).reduce((sum, val) => sum + val, 0);
  };

  // const convertFileToBase64 = async (file) => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = (e) => resolve(e.target.result);
  //     reader.onerror = reject;
  //     reader.readAsDataURL(file);
  //   });
  // };

  // function for name display correctly
  const getFileName = (fileObj) => {
    return fileObj.file?.name || fileObj.url?.split('/').pop();
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto my-8">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg z-10">
          <h3 className="text-2xl font-bold">
            {project ? 'Update Project' : 'Project Submission Checklist & Declaration Form'}
          </h3>
          <p className="text-blue-100 mt-1">
            {project ? 'Edit and resubmit your project' : 'Module 1: New Project Declaration'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* SECTION A: BASIC PROJECT DETAILS */}
          <div className="border-b border-gray-300 pb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">SECTION A: Basic Project Details</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={project?.title || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter project title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Funding Agency *</label>
                  <input
                    type="text"
                    name="fundingAgency"
                    required
                    defaultValue={project?.fundingAgency || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., DST, CSIR"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scheme / Call Ref No *</label>
                  <input
                    type="text"
                    name="schemeCallRefNo"
                    required
                    defaultValue={project?.schemeCallRefNo || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PI Name *</label>
                  <input
                    type="text"
                    name="pi"
                    required
                    defaultValue={user.name}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PI Designation *</label>
                  <input
                    type="text"
                    name="piDesignation"
                    required
                    defaultValue={user.designation}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PI Department *</label>
                  <input
                    type="text"
                    name="piDepartment"
                    required
                    defaultValue={user.department}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Co-Principal Investigator(s)</label>
                  {coPis.length < 2 && (
                    <button
                      type="button"
                      onClick={addCoPi}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Plus className="w-4 h-4" /> Add Co-PI
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {coPis.map((coPi, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={coPi.name}
                        onChange={(e) => updateCoPi(index, 'name', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Co-PI Name"
                      />
                      <input
                        type="text"
                        value={coPi.designation}
                        onChange={(e) => updateCoPi(index, 'designation', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Designation"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={coPi.department}
                          onChange={(e) => updateCoPi(index, 'department', e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Department"
                        />
                        {coPis.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCoPi(index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Collaborating Institute</label>
                <input
                  type="text"
                  name="collaboratingInstitute"
                  defaultValue={project?.collaboratingInstitute || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Start Date *</label>
                  <input
                    type="date"
                    name="projectStartDate"
                    required
                    defaultValue={project?.projectStartDate ? new Date(project.projectStartDate).toISOString().split('T')[0] : ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project End Date *</label>
                  <input
                    type="date"
                    name="projectEndDate"
                    required
                    defaultValue={project?.projectEndDate ? new Date(project.projectEndDate).toISOString().split('T')[0] : ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Estimated Budget (₹) *</label>
                  <input
                    type="number"
                    name="totalBudget"
                    required
                    min="0"
                    defaultValue={project?.totalBudget || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Funding Agency Format Followed *</label>
                  <select
                    name="fundingAgencyFormatFollowed"
                    required
                    defaultValue={project?.fundingAgencyFormatFollowed !== undefined ? (project.fundingAgencyFormatFollowed ? 'true' : 'false') : ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">AI Usage in Proposal (%) *</label>
                  <input
                    type="number"
                    name="aiUsagePercentage"
                    required
                    min="0"
                    max="100"
                    defaultValue={project?.aiUsagePercentage || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plagiarism Percentage (%) *</label>
                  <input
                    type="number"
                    name="plagiarismPercentage"
                    required
                    min="0"
                    max="100"
                    defaultValue={project?.plagiarismPercentage || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B: BUDGET HEADS */}
          <div className="border-b border-gray-300 pb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">SECTION B: Budget Heads</h4>
            <div className="space-y-3">
              {Object.keys(budgetHeads).map((head) => (
                <div key={head} className="flex items-center gap-4">
                  <label className="w-32 text-sm font-medium text-gray-700 capitalize">{head}:</label>
                  <input
                    type="number"
                    value={budgetHeads[head]}
                    onChange={(e) => handleBudgetChange(head, e.target.value)}
                    min="0"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
              <div className="flex items-center gap-4 pt-2 border-t border-gray-300">
                <label className="w-32 text-sm font-bold text-gray-800">Total:</label>
                <input
                  type="number"
                  value={calculateTotal()}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 font-bold"
                />
              </div>
            </div>
          </div>

          {/* SECTION C: DOCUMENT UPLOADS */}
          <div className="border-b border-gray-300 pb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">SECTION C: Document Uploads</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Complete Proposal (PDF/DOCX) *</label>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => handleFileChange('completeProposal', e)}
                  // required={!project}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {(files.completeProposal.file || files.completeProposal.url) && (
                  <p className="text-sm text-gray-600 mt-1">
                    {/* Selected:{files.completeProposal.name} */}
                    Selected: {getFileName(files.completeProposal)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Endorsement Letter (PDF/DOCX)</label>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => handleFileChange('endorsementLetter', e)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {(files.endorsementLetter.file || files.endorsementLetter.url) && (
                  <p className="text-sm text-gray-600 mt-1">
                    {/* Selected: {files.endorsementLetter.name} */}
                    Selected: {getFileName(files.endorsementLetter)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PI/Co-PI Undertaking (PDF/DOCX) *</label>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => handleFileChange('piCoPiUndertaking', e)}
                  // required={!project}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {(files.piCoPiUndertaking.file || files.piCoPiUndertaking.url) && (
                  <p className="text-sm text-gray-600 mt-1">
                    {/* Selected: {files.piCoPiUndertaking.name} */}
                    Selected: {getFileName(files.piCoPiUndertaking)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Other Supporting Documents (PDF/DOCX)</label>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => handleFileChange('otherSupportingDocs', e)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {files.otherSupportingDocs.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {files.otherSupportingDocs.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">
                          {/* {file.name} */}
                          {file.file?.name || file.url?.split('/').pop()}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeOtherDoc(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">Max file size: 10MB per file</p>
            </div>
          </div>

          {/* SECTION D: DECLARATION */}
          <div className="border-b border-gray-300 pb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">SECTION D: Declaration</h4>
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="declaration"
                required={!project}
                className="mt-1"
              />
              <label htmlFor="declaration" className="text-sm text-gray-700">
                I hereby declare that all the information provided above is true and correct to the best of my knowledge.
                I understand that any false information may lead to rejection of the project proposal.
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : project ? 'Update & Resubmit Project' : 'Submit Project'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={uploading}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
