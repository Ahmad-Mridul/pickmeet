"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight, SquarePen, View, Edit, Delete, DeleteIcon, Trash } from "lucide-react";
import Link from "next/link";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import Swal from 'sweetalert2';

export default function ExistingCardHolders() {
    const [cardHolders, setCardHolders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [open, setOpen] = useState(false);
    const [editingHolder, setEditingHolder] = useState(null);
    const { data: session } = useSession();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [adminPassword, setAdminPassword] = useState("");
    const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
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
            card: holder.card_number || "N/A",
            service_limit: holder.service_limit ?? "N/A",
            pick_limit: holder.pick_limit ?? 0,
            meet_limit: holder.meet_limit ?? 0,
            lounge_limit: holder.lounge_limit ?? 0
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

    const handleEdit = (id) => {
        const holder = cardHolders.find(h => (h.clientID || h.cardHolderId || h.id) === id);
        if (holder) {
            setEditingHolder({
                ...holder,
                clientID: holder.clientID || holder.cardHolderId || holder.id
            });
            setOpen(true);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setEditingHolder(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditingHolder(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        if (!editingHolder) return;

        fetch(`http://localhost:5000/card-holders/${editingHolder.clientID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(editingHolder),
        })
            .then(res => res.json())
            .then(data => {
                if (data.result) {
                    Swal.fire({
                        title: 'Success!',
                        text: 'Card holder updated successfully',
                        icon: 'success',
                        confirmButtonText: 'Ok'
                    });

                    // Update local state
                    const updatedHolders = cardHolders.map(h =>
                        ((h.clientID || h.cardHolderId || h.id) === editingHolder.clientID) ? { ...h, ...editingHolder } : h
                    );
                    setCardHolders(updatedHolders);
                    handleClose();
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to update card holder',
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                }
            })
            .catch(err => {
                console.error("Update failed:", err);
                Swal.fire({
                    title: 'Error!',
                    text: 'Something went wrong',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            });
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setDeleteOpen(true);
        setAdminPassword(""); // Reset password field
        setIsPasswordCorrect(false); // Reset verification
    };

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setAdminPassword(password);

        const userEmail = session?.user?.email;
        if (!userEmail || !password) {
            setIsPasswordCorrect(false);
            return;
        }

        // Simple debounce could be added here if needed, but for now direct call or onBlur is fine.
        // Let's do it on every change for better UX, but maybe check length > 0
        fetch('http://localhost:5000/verify-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, password })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setIsPasswordCorrect(true);
                } else {
                    setIsPasswordCorrect(false);
                }
            })
            .catch(err => setIsPasswordCorrect(false));
    };

    const handleConfirmDelete = () => {
        if (!isPasswordCorrect) return;

        const userEmail = session?.user?.email; // Get logged-in user's email

        if (!userEmail) {
            Swal.fire('Error', 'You must be logged in to perform this action', 'error');
            return;
        }

        fetch(`http://localhost:5000/card-holders/${deleteId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                password: adminPassword,
                userEmail: userEmail
            }),
        })
            .then(async res => {
                const data = await res.json();
                if (res.ok) {
                    Swal.fire('Deleted!', 'Card holder has been deleted.', 'success');
                    setCardHolders(prev => prev.filter(h => (h.clientID || h.cardHolderId || h.id) !== deleteId));
                    setDeleteOpen(false);
                } else {
                    Swal.fire('Error', data.error || 'Failed to delete', 'error');
                }
            })
            .catch(err => {
                console.error("Delete failed:", err);
                Swal.fire('Error', 'Something went wrong', 'error');
            });
    };

    const handleDeleteClose = () => {
        setDeleteOpen(false);
        setDeleteId(null);
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
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-500 transition-all shadow-sm"
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
                                <th className="px-6 py-4 border-b border-gray-100">Service Limit</th>
                                {/* <th className="px-6 py-4 border-b border-gray-100">Limits</th> */}
                                <th className="px-6 py-4 border-b border-gray-100">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 text-sm">
                            {currentData.length > 0 ? (
                                currentData.map((holder, index) => {
                                    const data = getHolderData(holder);
                                    console.log(holder);
                                    return (
                                        <tr key={index} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50 last:border-0">
                                            <td className="px-6 py-4 font-medium text-blue-600">{data.id}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-800">{data.name}</td>
                                            <td className="px-6 py-4 text-gray-600">{data.mobile}</td>
                                            <td className="px-6 py-4 text-gray-600">{data.email}</td>
                                            <td className="px-6 py-4 font-mono text-gray-600 ">{data.card}</td>
                                            <td className="px-6 py-4 font-mono text-gray-600 ">{data.pick_limit}</td>
                                            {/* <td className="px-6 py-4 font-mono text-gray-600 ">{data.service_limit}</td> */}
                                            <td className="px-6 py-4 flex items-center justify-center gap-3">
                                                <Link href={`/all-holders/${data.id}`}>
                                                    <View size={20} className="text-blue-600" />
                                                </Link>
                                                <button className="cursor-pointer btn btn-primary"
                                                    onClick={() => handleEdit(data.id)}>
                                                    <Edit size={20} className="text-blue-600" />
                                                </button>
                                                <button className="cursor-pointer btn btn-danger"
                                                    onClick={() => handleDeleteClick(data.id)}>
                                                    <Trash size={20} className="text-red-600" />
                                                </button>
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

            {/* Edit Modal */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Edit Card Holder</DialogTitle>
                <DialogContent>
                    {editingHolder && (
                        <div className="flex flex-col gap-4 mt-2">
                            <TextField
                                label="Full Name"
                                name="name"
                                value={editingHolder.name || ''}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                label="Mobile"
                                name="mobile"
                                value={editingHolder.mobile || ''}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                label="Email"
                                name="email"
                                value={editingHolder.email || ''}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                label="Card Number"
                                name="card_number"
                                value={editingHolder.card_number || ''}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                label="Address"
                                name="address"
                                value={editingHolder.address || ''}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={2}
                            />
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="inherit">Cancel</Button>
                    <Button onClick={handleSave} variant="contained" color="primary">Save Changes</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteOpen} onClose={handleDeleteClose} fullWidth maxWidth="xs">
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <div className="flex flex-col gap-4 mt-2">
                        <p className="text-sm text-gray-600">
                            Are you sure you want to delete this card holder? This action cannot be undone.
                            Please enter your password to confirm.
                        </p>
                        <TextField
                            label="Password"
                            type="password"
                            value={adminPassword}
                            onChange={handlePasswordChange}
                            fullWidth
                            error={adminPassword.length > 0 && !isPasswordCorrect}
                            helperText={adminPassword.length > 0 && !isPasswordCorrect ? "Incorrect password" : ""}
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteClose} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                        disabled={!isPasswordCorrect}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>

    );
}