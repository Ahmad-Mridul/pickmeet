"use client";

import { Autocomplete, FormControl, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function CreateService() {
    const [cardHolders, setCardHolders] = useState([]);
    const [selectedHolder, setSelectedHolder] = useState(null);

    useEffect(() => {
        const getCardHolders = async () => {
            const res = await fetch("http://localhost:5000/card-holders");
            const data = await res.json();
            setCardHolders(data);
        }
        getCardHolders();
    }, [selectedHolder?.lounge_limit]);
    const handldeBook = () => {
        if (selectedHolder?.lounge_limit > 0) {
            fetch(`http://localhost:5000/card-holders/${selectedHolder.clientID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...selectedHolder,
                    lounge_limit: selectedHolder.lounge_limit - 1
                }),
            })
                .then((res) => {
                    if (res.ok) {
                        Swal.fire({
                            title: "Booked successfully",
                            // text: "You clicked the button!",
                            icon: "success"
                        });
                        return res.json();
                    }
                    throw new Error("Failed to book service");
                })
                .then((data) => {
                    setSelectedHolder({ ...data.result, availEntertainment: (selectedHolder.availEntertainment || 0) + 1 });
                })
        }
    }
    return (
        <div className="p-4 sm:p-6 lg:p-8 font-sans">
            <h1 className="text-gray-600 uppercase font-bold text-3xl mb-8">Avail a service</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">Select Card Holder</h2>
                        <form method="post">
                            <FormControl fullWidth>
                                <Autocomplete
                                    id="card-holder-select"
                                    options={cardHolders}
                                    getOptionLabel={(option) => `${option.name} (${option.mobile})`}
                                    filterOptions={(options, state) => {
                                        const inputValue = state.inputValue.toLowerCase();
                                        const filtered = options.filter(option =>
                                            option.name?.toLowerCase().includes(inputValue) ||
                                            option.email?.toLowerCase().includes(inputValue) ||
                                            option.mobile?.toLowerCase().includes(inputValue) ||
                                            option.cardNumber?.toLowerCase().includes(inputValue)
                                        );
                                        return filtered.slice(0, 5);
                                    }}
                                    onChange={(event, newValue) => {
                                        setSelectedHolder(newValue);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Search Card Holder"
                                            variant="outlined"
                                            placeholder="Search by name, email, phone, or card number"
                                        />
                                    )}
                                />
                            </FormControl>
                        </form>

                    </div>
                    <div className="mt-5">

                        {selectedHolder && (
                            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
                                <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">Service Availability</h2>
                                {selectedHolder?.lounge_limit > 0 ? (
                                    <div className="bg-blue-400 rounded p-5 text-white">
                                        <p className="text-xl font-bold uppercase tracking-wider mb-1">Free booking Available</p>
                                        <p className="font-medium uppercase">Remaining Free Service: {selectedHolder?.lounge_limit}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-xl text-gray-500 font-bold uppercase tracking-wider mb-1">Not available for <span className="line-through text-red-600">free facilities</span></p>
                                    </div>
                                )}
                                {selectedHolder?.lounge_limit > 0
                                    &&
                                    <button className="bg-blue-500 p-2 rounded cursor-pointer text-white" onClick={handldeBook}>Book Free Service</button>
                                    // :
                                    // <button className="btn bg-red-600 border-0" onClick={handldeBook}>Book Paid Service</button>
                                }
                            </div>
                        )}
                    </div>
                </div>



                {selectedHolder && (
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all duration-300">
                        <div className="bg-linear-to-r from-indigo-600 to-blue-600 px-8 py-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-xl"></div>
                            <h2 className="text-2xl font-bold relative z-10">Cardholder Profile</h2>
                            <p className="text-indigo-100 mt-1 relative z-10">Member details and active status</p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                                    {selectedHolder.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Full Name</p>
                                    <p className="text-xl font-bold text-slate-800">{selectedHolder.name}</p>
                                </div>
                            </div>

                            <div className="h-px w-full bg-slate-100"></div>

                            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Client ID</p>
                                    <p className="font-medium text-slate-800">{selectedHolder.clientID || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mobile</p>
                                    <p className="font-medium text-slate-800">{selectedHolder.mobile || 'N/A'}</p>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</p>
                                    <p className="font-medium text-slate-800 truncate" title={selectedHolder.email}>{selectedHolder.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Card Number</p>
                                    <p className="font-mono font-medium text-slate-800">{selectedHolder.card_number || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Card Type</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                                        {selectedHolder.card_type?.replace('_', ' ') || 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Exp Date</p>
                                    <p className="font-medium text-slate-800">{selectedHolder.expDate || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Entertainment Limit</p>
                                    <div className="flex items-center">
                                        {/* <div className="w-full bg-slate-200 rounded-full h-2.5 mr-2">
                                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${Math.min((selectedHolder.entertainment || 0) * 10, 100)}%` }}></div>
                                        </div> */}
                                        <span className="font-medium text-slate-800">{selectedHolder.lounge_limit || 0}</span>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Avail Entertainment</p>
                                    <div className="flex items-center">
                                        {/* <div className="w-full bg-slate-200 rounded-full h-2.5 mr-2">
                                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${Math.min((selectedHolder.entertainment || 0) * 10, 100)}%` }}></div>
                                        </div> */}
                                        <span className="font-medium text-slate-800">{selectedHolder.availEntertainment || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    )
}