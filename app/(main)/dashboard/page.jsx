import React from 'react'
import Welcome from './_components/Welcome'
import CreateOption from './_components/CreateOption'
import LatestInterViewList from './_components/LatestInterViewList'

function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600">Manage your AI-powered interviews and streamline your hiring process</p>
        </div>

        {/* Welcome Section */}
        <div className="mb-8">
          <Welcome />
        </div>

        {/* Quick Actions Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <CreateOption />
        </div>

        {/* Recent Interviews Section */}
        <div>
          <LatestInterViewList />
        </div>
      </div>
    </div>
  )
}

export default Dashboard