"use client"
import { useUser } from '@/app/provider'
import { Button } from '@/components/ui/button'
import { supabase } from '@/services/superbaseClient'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

function Header() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  
  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      setAuthenticated(!!data.session)
    }
    
    checkAuth()
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthenticated(!!session)
    })
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setAuthenticated(false)
      router.push('/auth')
    } catch (error) {
      console.error('Error signing out:', error.message)
    }
  }

  return (
    <div className='p-3 border shadow-sm'>
      <div className='flex justify-between items-center'>
        <Link href='/'>
          <Image src={'/logo.svg'} width={100} height={80} alt="Logo" />
        </Link>
        
        <div className='flex items-center gap-4'>
          {authenticated ? (
            <>
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
              <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
            </>
          ) : (
            <>
              <Link href="/auth">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Header