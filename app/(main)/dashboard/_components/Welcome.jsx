"use client"
import { useUser } from '@/app/provider'
import { UserRoundSearch } from 'lucide-react'
import Image from 'next/image'
import React from 'react'


function Welcome() {
    const { user } = useUser()
    return (
        <div className=' p-4 rounded-2xl shadow-md flex justify-between items-center'>
        <div >
            <h2 className='text-lg font-bold'>Welcome Back, {user?.name}</h2>
            <h2 className='text-gray-500'>AI-Driven Interviews, Hassle-free Hiring</h2>
        </div>
       {user && <Image src={user?.picture} alt="user" width={50} height={50} className='rounded-full mt-5' />}
        </div>
    )
}

export default Welcome