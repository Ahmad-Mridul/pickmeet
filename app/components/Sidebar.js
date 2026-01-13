"use client";

import { Home, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    const menuItems = [
        { name: "Home", icon: Home, href: "/" },
        { name: "Pick & Drop", icon: MapPin, href: "/pick-drop" },
        { name: "Meet & Greet", icon: Users, href: "/meet-greet" },
    ];

    const sidebarClass = isCollapsed ? "w-20" : "w-64";

    return (
        <div
            className={`${sidebarClass} bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen transition-all duration-300 ease-in-out flex flex-col shadow-xl z-50`}
        >
            {/* Header / Logo Area */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 h-20">
                {!isCollapsed && (
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-gray-400 bg-clip-text text-transparent">
                        PickMeet
                    </h1>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 py-6 space-y-2 px-3 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? "bg-blue-600 shadow-lg shadow-blue-500/30 text-white"
                                : "hover:bg-gray-700 text-gray-300 hover:text-white"
                                }`}
                        >
                            <item.icon
                                size={22}
                                className={`${isCollapsed ? "mx-auto" : "mr-4"} ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                                    }`}
                            />
                            {!isCollapsed && (
                                <span className="font-medium whitespace-nowrap">
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer User Profile (Optional placeholder) */}
            <div className="p-4 border-t border-gray-700">
                <div className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"}`}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-blue-500 flex items-center justify-center font-bold text-white shadow-md">
                        U
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate">User Name</p>
                            <p className="text-xs text-gray-400 truncate">user@example.com</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
