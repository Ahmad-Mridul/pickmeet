"use client";

import { UserPlus, Save, CreditCard } from "lucide-react";

export default function CardHolder() {
    return (
        <div className="p-8 min-h-full bg-gray-50">
            {/* Page Header */}
            <div className="flex items-center gap-3 mb-6">
                <CreditCard className="text-gray-800" size={28} />
                <h1 className="text-2xl font-bold text-gray-800">Manage Card Holders</h1>
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
                <form className="p-8 space-y-8">
                    {/* Section 1: Identity & Card Info */}
                    <div>
                        <h3 className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
                            Identity & Card Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <input
                                    type="text"
                                    placeholder="Card Holder ID"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-700"
                                />
                            </div>
                            <div className="space-y-1">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-700"
                                />
                            </div>
                            <div className="space-y-1">
                                <input
                                    type="text"
                                    placeholder="Card Number"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-700"
                                />
                            </div>
                            <div className="space-y-1">
                                <input
                                    type="tel"
                                    placeholder="Mobile Number"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-700"
                                />
                            </div>
                            <div className="space-y-1 md:col-span-1">
                                <input
                                    type="email"
                                    placeholder="Email Address"
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
                                placeholder="Mailing Address"
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
                            />
                        </div>
                    </div>
                    {/* Footer Actions */}
                    <div className="flex justify-end">
                        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors shadow-sm">
                            <UserPlus size={18} />
                            SAVE HOLDER
                        </button>
                    </div>
                </form>


            </div>
        </div>
    );
}
