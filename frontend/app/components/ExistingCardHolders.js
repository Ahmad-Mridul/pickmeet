"use client";
import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight, SquarePen, View } from "lucide-react";
import Link from "next/link";

export default function ExistingCardHolders() {
    const [cardHolders, setCardHolders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;




    useEffect(() => {
        fetch("http://localhost:5000/card-holders")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCardHolders(data);
                } else {
                    console.error("API response is not an array:", data);
                    setCardHolders([]);
                }
            })
            .catch(err => console.error("Failed to fetch card holders:", err));
    }, []);
    // Helper to extract data handling potential different key names safely
    const getHolderData = (holder) => {
        return {
            id: holder.clientID || holder.cardHolderId || holder.id || "N/A",
            name: holder.name || holder.fullName || "N/A",
            mobile: holder.mobile || holder.mobileNumber || holder.phone || "N/A",
            email: holder.email || "N/A",
            card: holder.card_number || "N/A"
        };
    };

    // Filter logic
    const filteredHolders = cardHolders.filter(holder => {
        const searchLower = searchTerm.toLowerCase();
        const data = getHolderData(holder);

        return (
            data.id.toString().toLowerCase().includes(searchLower) ||
            data.mobile.toString().toLowerCase().includes(searchLower) ||
            data.email.toLowerCase().includes(searchLower) ||
            data.card.toString().toLowerCase().includes(searchLower)
        );
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredHolders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredHolders.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div>
            <div className="mb-5 flex justify-end">
                <Link href="/register-card-holder" className="shadow-lg bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Add Card-holder
                </Link>
            </div>
            <div className="bg-white rounded-lg shadow-md border-l-4 border-l-blue-600 overflow-hidden">
                {/* Header */}

                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-bold text-gray-900">Existing Card Holders</h2>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search ID, Mobile, Email..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4 border-b border-gray-100">Card Holder ID</th>
                                <th className="px-6 py-4 border-b border-gray-100">Full Name</th>
                                <th className="px-6 py-4 border-b border-gray-100">Mobile</th>
                                <th className="px-6 py-4 border-b border-gray-100">Email</th>
                                <th className="px-6 py-4 border-b border-gray-100">Card Number</th>
                                <th className="px-6 py-4 border-b border-gray-100">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 text-sm">
                            {currentData.length > 0 ? (
                                currentData.map((holder, index) => {
                                    const data = getHolderData(holder);
                                    return (
                                        <tr key={index} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50 last:border-0">
                                            <td className="px-6 py-4 font-medium text-blue-600">{data.id}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-800">{data.name}</td>
                                            <td className="px-6 py-4 text-gray-600">{data.mobile}</td>
                                            <td className="px-6 py-4 text-gray-600">{data.email}</td>
                                            <td className="px-6 py-4 font-mono text-gray-600 ">{data.card}</td>
                                            <td className="px-6 py-4 flex items-center justify-center">
                                                <Link href={`/all-holders/${data.id}`}>
                                                    <View size={20} className="text-blue-600" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <Search size={48} className="mb-2 opacity-20" />
                                            <p className="text-lg font-medium text-gray-500">No card holders found</p>
                                            <p className="text-sm">Try adjusting your search criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                        <div className="text-sm text-gray-500 font-medium">
                            Showing <span className="text-gray-900">{startIndex + 1}</span> to <span className="text-gray-900">{Math.min(startIndex + itemsPerPage, filteredHolders.length)}</span> of <span className="text-gray-900">{filteredHolders.length}</span> results
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-md transition-all ${currentPage === 1
                                    ? 'text-gray-300 cursor-not-allowed bg-transparent'
                                    : 'text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-md bg-transparent'
                                    }`}
                                aria-label="Previous Page"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="flex items-center gap-1">
                                <span className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm font-bold shadow-sm">
                                    {currentPage}
                                </span>
                                <span className="text-gray-400 text-sm">/</span>
                                <span className="text-sm text-gray-600 font-medium">{totalPages}</span>
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-md transition-all ${currentPage === totalPages
                                    ? 'text-gray-300 cursor-not-allowed bg-transparent'
                                    : 'text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-md bg-transparent'
                                    }`}
                                aria-label="Next Page"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

    );
}