"use client";

import { Home, MapPin, Users, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    // Track which menu text is open. Default empty or expanded if active? keeping simple for now.
    const [expandedMenu, setExpandedMenu] = useState("Pick & Drop");
    const pathname = usePathname();

    const menuItems = [
        { name: "Home", icon: Home, href: "/" },
        {
            name: "Pick & Drop",
            icon: MapPin,
            href: "/pick-drop",
            children: [
                { name: "Card Holder", href: "/pick-drop/card-holder" },
                { name: "Merchant", href: "/pick-drop/merchant" },
                { name: "Service Ticket", href: "/pick-drop/service-ticket" },
            ]
        },
        { name: "Meet & Greet", icon: Users, href: "/meet-greet" },
    ];

    const sidebarClass = isCollapsed ? "w-20" : "w-64";

    const toggleSubMenu = (name) => {
        if (isCollapsed) setIsCollapsed(false); // Open sidebar if clicking a menu
        setExpandedMenu(expandedMenu === name ? null : name);
    };

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
                    const isActive = pathname === item.href || (item.children && item.children.some(child => pathname === child.href));
                    const isExpanded = expandedMenu === item.name;
                    const hasChildren = item.children && item.children.length > 0;

                    return (
                        <div key={item.name}>
                            {/* Parent Menu Item */}
                            <div
                                onClick={() => hasChildren ? toggleSubMenu(item.name) : null}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer ${isActive && !hasChildren
                                    ? "bg-blue-600 shadow-lg shadow-blue-500/30 text-white"
                                    : "hover:bg-gray-700 text-gray-300 hover:text-white"
                                    } ${hasChildren ? "" : ""}`} // Add container styling if needed
                            >
                                <div className="flex items-center">
                                    <item.icon
                                        size={22}
                                        className={`${isCollapsed ? "mx-auto" : "mr-4"} ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                                            }`}
                                    />
                                    {!isCollapsed && (
                                        <Link href={item.href} className="flex-1">
                                            <span className="font-medium whitespace-nowrap">{item.name}</span>
                                        </Link>
                                    )}
                                </div>

                                {!isCollapsed && hasChildren && (
                                    <button className="focus:outline-none text-gray-400 hover:text-white">
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                )}
                            </div>

                            {/* Submenu Items */}
                            {!isCollapsed && hasChildren && isExpanded && (
                                <div className="ml-10 mt-1 space-y-1 border-l-2 border-gray-700 pl-2">
                                    {item.children.map((child) => {
                                        const isChildActive = pathname === child.href;
                                        return (
                                            <Link
                                                key={child.name}
                                                href={child.href}
                                                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${isChildActive
                                                    ? "bg-gray-700 text-white font-medium"
                                                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                                                    }`}
                                            >
                                                {child.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
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
