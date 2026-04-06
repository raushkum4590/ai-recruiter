import { Phone, Video, Plus, Clock, Users, Zap } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function CreateOption() {
  const options = [
    {
      href: '/dashboard/create-interview',
      icon: <Video className="h-7 w-7" />,
      title: 'Create New Interview',
      desc: 'Set up AI-powered video interviews with custom questions',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      iconBg: 'bg-blue-500',
      features: ['AI Questions', 'Video Recording', 'Automated Scoring']
    },
    {
      href: '#',
      icon: <Phone className="h-7 w-7" />,
      title: 'Phone Screening Call',
      desc: 'Quick phone interviews for initial candidate screening',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      iconBg: 'bg-green-500',
      features: ['Voice Analysis', 'Real-time Notes', 'Quick Setup']
    },
  ]

  const quickActions = [
    { icon: <Users className="h-5 w-5" />, label: 'View All Interviews', href: '/dashboard/all-interview' },
    { icon: <Clock className="h-5 w-5" />, label: 'Scheduled Interviews', href: '/dashboard/scheduled-interviews' },
    { icon: <Zap className="h-5 w-5" />, label: 'Analytics', href: '/dashboard/analytics' },
  ]

  return (
    <div className="space-y-8">
      {/* Main Create Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {options.map((option, index) => (
          <Link
            key={index}
            href={option.href}
            className={`group relative overflow-hidden rounded-2xl ${option.bgColor} border-2 border-transparent hover:border-gray-200 transition-all duration-300 hover:shadow-xl`}
          >
            <div className="p-8">
              {/* Icon and Header */}
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 ${option.iconBg} text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {option.icon}
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-700 shadow-sm">
                    <Plus className="h-3 w-3 mr-1" />
                    Create New
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-gray-600 mt-2 leading-relaxed">{option.desc}</p>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {option.features.map((feature, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white bg-opacity-70 text-gray-700"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hover Arrow */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="p-2 bg-white rounded-full shadow-lg">
                  <Plus className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="flex items-center space-x-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 group"
            >
              <div className="p-2 bg-gray-100 group-hover:bg-gray-200 rounded-lg transition-colors">
                {action.icon}
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CreateOption
