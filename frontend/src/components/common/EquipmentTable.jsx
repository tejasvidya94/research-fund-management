import React from 'react';
import { FaSearch } from 'react-icons/fa';

const EquipmentTable = ({
    equipmentRequests,
    onApprove,
    onReject,
    onViewDetails,
    startIndex = 0,
    searchQuery,
    onSearchChange
}) => {
    const handleSearch = (e) => {
        e.preventDefault();
    };

    const formatCurrency = (amount) => {
        return (amount || 0).toLocaleString('en-IN');
    };

    const safeText = (text) => {
        return text || 'N/A';
    };

    return (
        <div className="bg-transparent overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-white">Resource Allotment</h2>

                <div className="relative flex items-center bg-gray-900/50 rounded-md border border-gray-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition duration-200 ease-in-out">
                    <input
                        type="text"
                        placeholder="Search resource allotment requests..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-4 pr-10 py-2 bg-transparent rounded-md focus:outline-none w-64 text-white placeholder-gray-400"
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-gray-400 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-r-md"
                        aria-label="Search"
                    >
                        <FaSearch className="text-lg" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                    <thead className="bg-gray-900/70 border-b border-gray-700">
                        <tr>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase w-16 min-w-[4rem]">S.No.</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase w-64 min-w-[16rem]">Equipment Name</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase w-48 min-w-[12rem]">Project</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase w-24 min-w-[6rem]">Quantity</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase w-32 min-w-[8rem]">Total Amount</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase w-32 min-w-[8rem]">Current Stage</th>
                            <th className="py-3 px-4 text-center text-sm font-semibold text-gray-300 uppercase w-32 min-w-[8rem]">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-700">
                        {equipmentRequests.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-6 text-center text-gray-400">
                                    No resource allotment requests found.
                                </td>
                            </tr>
                        ) : (
                            equipmentRequests.map((request, index) => (
                                <tr key={request.id || index} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="py-4 px-4 text-gray-300">
                                        {startIndex + index + 1}
                                    </td>

                                    <td
                                        className="py-4 px-4 text-blue-400 font-medium cursor-pointer hover:text-blue-300 hover:underline truncate"
                                        onClick={() => onViewDetails(request)}
                                    >
                                        {safeText(request.equipmentName)}
                                    </td>

                                    <td className="py-4 px-4 text-gray-300 truncate">
                                        {safeText(request.projectTitle)}
                                    </td>

                                    <td className="py-4 px-4 text-gray-300 whitespace-nowrap">
                                        {request.quantity}
                                    </td>

                                    <td className="py-4 px-4 text-gray-300 whitespace-nowrap">
                                        ₹{formatCurrency(request.totalAmount)}
                                    </td>

                                    <td className="py-4 px-4 text-gray-300 font-medium">
                                        {safeText(request.currentStage)}
                                    </td>

                                    <td className="py-4 px-4 text-center">
                                        <button
                                            onClick={() => onViewDetails(request)}
                                            className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-200 shadow-sm"
                                        >
                                            Review / Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EquipmentTable;

