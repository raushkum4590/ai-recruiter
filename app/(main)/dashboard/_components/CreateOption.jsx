import { Phone, Video } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function CreateOption() {
  const options = [
    {
      href: '/dashboard/create-interview',
      icon: <Video className="h-6 w-6" />,
      title: 'Create New Interview',
      desc: 'Create a new interview with candidates',
    },
    {
      href: '#',
      icon: <Phone className="h-6 w-6" />,
      title: 'Create Phone Screening Call',
      desc: 'Create a new phone screening with candidates',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {options.map((option, index) => (
        <Link
          key={index}
          href={option.href}
          className="group shadow-md hover:shadow-lg transition-all border border-gray-100 rounded-2xl p-6 bg-white"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 text-blue-500 rounded-xl transition-colors group-hover:bg-blue-200">
              {option.icon}
            </div>
            <h1 className="text-lg font-semibold">{option.title}</h1>
          </div>
          <p className="text-gray-500">{option.desc}</p>
        </Link>
      ))}
    </div>
  )
}

export default CreateOption
