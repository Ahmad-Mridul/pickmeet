"use client";

import { UserPlus, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CardHolder() {
    const [clientID, setClientID] = useState("");
    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");
    const [card_number, setCardNumber] = useState("");
    const [card_type, setCardType] = useState("");
    const [service_limit, setServiceLimit] = useState(0);
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSaveHolder = async (e) => {
        e.preventDefault();
        if (card_type === "platinum") {
            setServiceLimit(6);
        }
        // Basic validation
        if (!clientID || !name || !mobile || !card_number) {
            alert("Please fill in all required fields (ID, Name, Mobile, Card Number)");
            return;
        }

        setIsLoading(true);

        // const cardHolder = {
        //     clientID: Number(clientID), // API expects Number
        //     name,
        //     mobile,
        //     card_number,
        //     card_type,
        //     email,
        //     address,
        //     role: "customer"
        // };
        // const user = {
        //     email: cardHolder.email,
        //     password: "N/A",
        //     role: "customer",
        // }
        // console.log("HI", user);

        try {
            const payload = {
                // Card Holder data
                clientID: Number(clientID), name, mobile, card_number, card_type, service_limit, email, address,
                // User data
                password: "N/A", role: "customer"
            };

            const response = await fetch("http://localhost:5000/register/card-holder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });


            if (response.ok) {
                // alert("Card holder registered successfully!");
                // Reset form
                setClientID("");
                setName("");
                setMobile("");
                setEmail("");
                setAddress("");
                setCardNumber("");
                // Refresh the list
                setRefreshKey(prev => prev + 1);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert(`An error occurred: ${error.message}. Please check your internet connection.`);
        } finally {
            setIsLoading(false);
        }

    }

    return (
        <div className="p-8 min-h-full bg-gray-50">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <CreditCard className="text-gray-800" size={28} />
                    <h1 className="text-2xl font-bold text-gray-800">Manage Card Holders</h1>
                </div>
                <div>
                    <Link href="/pick-drop/all-holders" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        View All Card Holders
                    </Link>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-lg shadow-md border-l-4 border-l-blue-600 overflow-hidden">
                {/* Card Header */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <UserPlus className="text-blue-600" size={20} />
                        <h2 className="text-lg font-bold text-gray-900">Register Card Holder</h2>
                    </div>
                    <p className="text-gray-500 text-sm">
                        Fill out the form to create a new card holder profile.
                    </p>
                </div>

                {/* Form Content */}
                <form className="p-8 space-y-8" onSubmit={handleSaveHolder}>
                    {/* Section 1: Identity & Card Info */}
                    <div>
                        <h3 className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
                            Identity & Card Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Card Holder ID <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="clientID"
                                    value={clientID}
                                    onChange={(e) => setClientID(e.target.value)}
                                    placeholder="e.g. 123456"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-700"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-700"
                                    required
                                />
                            </div>


                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Card Number <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="card_number"
                                    value={card_number}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    placeholder="XXXX-XXXX-XXXX-XXXX"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-700"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Card Type <span className="text-red-500">*</span></label>
                                <select
                                    name="card_type"
                                    value={card_type}
                                    onChange={(e) => setCardType(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-700"
                                    required
                                >
                                    <option value="">Select Card Type</option>
                                    <option value="platinum">Platinum</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Mobile Number <span className="text-red-500">*</span></label>
                                <input
                                    type="tel"
                                    name="mobile"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="e.g. +1234567890"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-700"
                                    required
                                />
                            </div>
                            <div className="space-y-1 md:col-span-1">
                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="john@example.com"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-700"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Mailing Address */}
                    <div>
                        <h3 className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
                            Mailing Address
                        </h3>
                        <div className="space-y-1">
                            <input
                                type="text"
                                name="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Full Mailing Address"
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
                            />
                        </div>
                    </div>
                    {/* Footer Actions */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex items-center gap-2 text-white font-semibold py-2 px-6 rounded-md transition-colors shadow-sm ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    SAVING...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} />
                                    SAVE HOLDER
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
}
