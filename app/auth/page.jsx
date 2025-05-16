"use client"
import { Button } from '@/components/ui/button'
import { supabase } from '@/services/superbaseClient'
import Image from 'next/image'
import React from 'react'

function Login() {

  

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    })
    if (error) {
      console.error('Error signing in:', error.message)
    }
  }
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <div className='flex flex-col items-center border rounded-2xl p-8 '>
        <Image src='/logo.svg' alt='logo' width={400} height={100} 
        className='w-[180px]'/>
        <div className='flex flex-col items-center'>
          <Image src='/ai.jpeg' alt='login' width={600} height={400}
          className='w-[400px] h-[250px] rounded-2xl mt-3'/>
          <h2 className='text-2xl font-bold text-center mt-5'>Welcome To Ai Recruiter</h2>
          <p className='text-center text-gray-600'>Your AI powered recruitment assistant</p>
          <p className='text-center text-gray-600'>Please login to continue</p>
       <Button onClick={signInWithGoogle} className='mt-7 w-full'>Login With Google</Button>
        </div>
      </div>
    </div>
  )
}

export default Login