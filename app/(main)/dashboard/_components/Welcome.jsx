"use client"
import { useUser } from '@/app/provider'
import { Calendar, Users, Award, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

function Welcome() {
    const { user } = useUser()
    
    const stats = [
        { icon: <Users className="h-5 w-5" />, label: "Total Interviews", value: "24", color: "text-blue-600 bg-blue-100" },
        { icon: <Calendar className="h-5 w-5" />, label: "This Week", value: "8", color: "text-green-600 bg-green-100" },
        { icon: <Award className="h-5 w-5" />, label: "Success Rate", value: "89%", color: "text-purple-600 bg-purple-100" },
        { icon: <TrendingUp className="h-5 w-5" />, label: "Growth", value: "+12%", color: "text-orange-600 bg-orange-100" }
    ]

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Welcome Back, {user?.name || 'User'}!</h2>
                        <p className="text-blue-100">AI-Driven Interviews, Hassle-free Hiring</p>
                    </div>
                    {user && (
                        <div className="flex items-center space-x-3">
                            <div className="text-right">
                                <p className="text-sm text-blue-100">Recruiter</p>
                                <p className="text-xs text-blue-200">{user?.email}</p>
                            </div>
                            <Image 
                                src={user?.picture} 
                                alt="user" 
                                width={60} 
                                height={60} 
                                className="rounded-full border-3 border-white shadow-lg" 
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Section */}
            <div className="p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${stat.color}`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-sm text-gray-600">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Welcome