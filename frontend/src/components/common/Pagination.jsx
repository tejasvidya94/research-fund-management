// src/components/Pagination.jsx
import React from 'react';
// 1. Import the arrow icons
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
    const pageNumbers = [];
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    // Don't render pagination if there's only one page
    if (totalPages <= 1) {
        return null;
    }

    // 2. Handler for "Previous"
    const handlePrevious = () => {
        if (currentPage > 1) {
            paginate(currentPage - 1);
        }
    };

    // 3. Handler for "Next"
    const handleNext = () => {
        if (currentPage < totalPages) {
            paginate(currentPage + 1);
        }
    };

    return (
        <nav>
            <ul className="flex justify-center list-none p-4 items-center">
                {/* 4. Previous Arrow Button */}
                <li>
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className={`py-2 px-3 rounded-md focus:outline-none transition-colors duration-200 flex items-center
              ${currentPage === 1
                                ? 'text-gray-600 cursor-not-allowed'
                                : 'text-blue-400 hover:bg-gray-800'
                            }
            `}
                    >
                        <FaChevronLeft className="h-4 w-4" />
                        <span className="ml-2">Previous</span>
                    </button>
                </li>

                {/* Page Number Buttons */}
                {pageNumbers.map(number => (
                    <li key={number} className="mx-1">
                        <button
                            onClick={() => paginate(number)}
                            className={`py-2 px-4 rounded-md focus:outline-none transition-colors duration-200
                ${currentPage === number
                                    ? 'bg-blue-600 text-white' // Active page style
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700' // Default page style
                                }
              `}
                        >
                            {number}
                        </button>
                    </li>
                ))}

                {/* 5. Next Arrow Button */}
                <li>
                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className={`py-2 px-3 rounded-md focus:outline-none transition-colors duration-200 flex items-center
              ${currentPage === totalPages
                                ? 'text-gray-600 cursor-not-allowed'
                                : 'text-blue-400 hover:bg-gray-800'
                            }
            `}
                    >
                        <span className="mr-2">Next</span>
                        <FaChevronRight className="h-4 w-4" />
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;