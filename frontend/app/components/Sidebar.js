"use client";

import { Button } from "@mui/material";
import { Home, MapPin, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Sofa, Store, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";




export default function Sidebar() {
    const session = useSession();
    const [userProfile, setUserProfile] = useState(null);
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch("http://localhost:5000/merchants");
                if (!response.ok) return;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await response.json();
                    setUserProfile(data.find(merchant => merchant.userId === session?.data?.user?.id));
                }
            } catch (error) {
                console.error("Sidebar Fetch Error:", error);
            }
        };
        fetchUserProfile();
    }, [session]);
    const [isCollapsed, setIsCollapsed] = useState(false);
    // Track which menu text is open. Default empty or expanded if active? keeping simple for now.
    const [expandedMenu, setExpandedMenu] = useState("Pick & Drop");
    const [isMobileOpen, setIsMobileOpen] = useState(false); // Mobile sidebar state
    const pathname = usePathname();

    const menuItems = [
        { name: "Home", icon: Home, href: "/" },
        { name: "Card Holder", icon: Users, href: "/all-holders" },
        { name: "Merchant", icon: Store, href: "/all-merchants" },
        {
            name: "Pick & Drop",
            icon: MapPin,
            href: "/pick-drop",
            children: [
                { name: "Service Ticket", href: "/pick-drop/all-service-tickets" },
            ]
        },
        {
            name: "Meet & Greet",
            icon: Users,
            href: "/meet-greet",
            children: [
                { name: "Service Ticket", href: "/meet-greet/all-service-tickets" },
            ]
        },
        {
            name: "Lounge Access",
            icon: Sofa,
            href: "/lounge",
            children: [
                { name: "Lounge Request", href: "/lounge/all-service-tickets" },
            ]
        },
    ];

    const toggleSubMenu = (name) => {
        if (isCollapsed) setIsCollapsed(false); // Open sidebar if clicking a menu
        setExpandedMenu(expandedMenu === name ? null : name);
    };

    return (
        <>
            {/* Mobile Hamburger Toggle Button */}
            <button
                className="md:hidden fixed top-4 right-4 z-[60] p-2 bg-blue-600 text-white rounded-md shadow-md focus:outline-none"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                {isMobileOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                )}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/60 z-[40]" 
                    onClick={() => setIsMobileOpen(false)} 
                />
            )}

            {/* Sidebar Container */}
            <div
                className={`
                    fixed md:static inset-y-0 left-0 z-[50]
                    flex flex-col flex-shrink-0
                    bg-gray-900 border-r border-gray-800 text-gray-300
                    h-screen overflow-y-auto overflow-x-hidden
                    transform transition-transform duration-300 ease-in-out
                    w-64 md:w-[250px] lg:w-[280px]
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                {/* Header / Logo Area */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800 flex-shrink-0">
                    {!isCollapsed && (
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent truncate">
                            Airport Service
                        </h1>
                    )}
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 py-6 space-y-2 px-4 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || (item.children && item.children.some(child => pathname.includes(child.href)));
                        const isExpanded = expandedMenu === item.name;
                        const hasChildren = item.children && item.children.length > 0;

                        return (
                            <div key={item.name}>
                                {/* Parent Menu Item */}
                                <div
                                    onClick={() => hasChildren ? toggleSubMenu(item.name) : null}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer ${isActive && !hasChildren
                                        ? "bg-blue-600 shadow-lg shadow-blue-500/30 text-white font-medium"
                                        : "hover:bg-gray-800 text-gray-400 hover:text-white"
                                        }`}
                                >
                                    <div className="flex items-center w-full">
                                        <item.icon
                                            size={20}
                                            className={`${isCollapsed ? "mx-auto" : "mr-4"} ${isActive ? "text-white" : "text-gray-500 group-hover:text-blue-400"} flex-shrink-0`}
                                        />
                                        {!isCollapsed && (
                                            <Link href={item.href} className="flex-1 truncate" onClick={() => !hasChildren && setIsMobileOpen(false)}>
                                                <span className={`${isActive ? "font-semibold" : "font-medium"} whitespace-nowrap`}>{item.name}</span>
                                            </Link>
                                        )}
                                    </div>

                                    {!isCollapsed && hasChildren && (
                                        <button className="focus:outline-none text-gray-500 hover:text-white flex-shrink-0 ml-2">
                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                    )}
                                </div>

                                {/* Submenu Items */}
                                {!isCollapsed && hasChildren && isExpanded && (
                                    <div className="ml-11 mt-1 space-y-1 border-l border-gray-700 pl-3">
                                        {item.children.map((child) => {
                                            const isChildActive = pathname.includes(child.href);
                                            return (
                                                <Link
                                                    key={child.name}
                                                    href={child.href}
                                                    onClick={() => setIsMobileOpen(false)}
                                                    className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${isChildActive
                                                        ? "bg-gray-800 text-blue-400 font-semibold"
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

                {/* Footer User Profile */}
                <div className="p-5 border-t border-gray-800 bg-gray-900/50 flex-shrink-0">
                    <div className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-4"}`}>
                        {!isCollapsed && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-semibold text-white truncate">{userProfile?.name || "Welcome Back!"}</p>
                                <p className="text-xs text-gray-400 truncate">{session?.data?.user?.email || "Manage Your Account"}</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-4">
                        {
                            session.status === "authenticated" ? (
                                <Button variant="contained" color="error" fullWidth sx={{ textTransform: 'none', fontWeight: 'bold' }} onClick={() => signOut()}>Logout</Button>
                            ) : (
                                <Button variant="contained" color="primary" fullWidth sx={{ textTransform: 'none', fontWeight: 'bold' }} onClick={() => signIn()}>Login</Button>
                            )
                        }
                    </div>
                </div>
            </div>
        </>
    );
}
