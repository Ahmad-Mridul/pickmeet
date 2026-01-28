"use client";

import Link from "next/link";
import { MapPin, Users, Clock, CheckCircle, TrendingUp, AlertCircle } from "lucide-react";

export default function Home() {
  const stats = [
    { label: "Active Requests", value: "12", icon: Clock, color: "text-blue-500", bg: "bg-blue-100" },
    { label: "Completed Today", value: "8", icon: CheckCircle, color: "text-green-500", bg: "bg-green-100" },
    { label: "Pending Actions", value: "3", icon: AlertCircle, color: "text-red-500", bg: "bg-red-100" },
    { label: "Total Revenue", value: "$4,250", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-100" },
  ];

  const activities = [
    { title: "Pick & Drop Request", desc: "Package from Downtown to Airport", time: "10 mins ago", status: "In Progress" },
    { title: "Meet & Greet", desc: "VIP Guest Arrival at Terminal 3", time: "45 mins ago", status: "Scheduled" },
    { title: "Pick & Drop Completed", desc: "Document delivery to Law Firm", time: "2 hours ago", status: "Completed" },
  ];

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-full">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          <span className="text-sm font-medium text-gray-600">Jan 13, 2026</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/pick-drop" className="group relative overflow-hidden bg-white p-8 rounded-3xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <MapPin size={120} className="text-blue-500 transform rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            </div>
            <div className="relative z-10">
              <div className="p-4 bg-blue-50 w-fit rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <MapPin size={32} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pick & Drop</h3>
              <p className="text-gray-500 max-w-sm">Schedule a new pickup or delivery request instantly. Real-time tracking included.</p>
            </div>
          </Link>

          <Link href="/meet-greet" className="group relative overflow-hidden bg-white p-8 rounded-3xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users size={120} className="text-purple-500 transform -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            </div>
            <div className="relative z-10">
              <div className="p-4 bg-purple-50 w-fit rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users size={32} className="text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Meet & Greet</h3>
              <p className="text-gray-500 max-w-sm">arrange a professional meet and greet service for VIPs and guests.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start justify-between border-b border-gray-50 last:border-0 pb-6 last:pb-0">
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                  <p className="text-sm text-gray-500">{activity.desc}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${activity.status === "Completed" ? "bg-green-100 text-green-700" :
                  activity.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                  {activity.status}
                </span>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}