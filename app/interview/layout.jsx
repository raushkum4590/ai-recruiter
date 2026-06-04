"use client"
import React, { useState } from 'react'
import InterviewHeader from './_components/InterviewHeader'
import { InterviewDataContext } from '@/context/InterViewDataContext'
import { usePathname } from 'next/navigation'

function layout({ children }) {
  const [interviewInfo, setInterviewInfo] = useState();
  const pathname = usePathname();
  const isStartPage = pathname?.includes('/start');

  return (
    <InterviewDataContext.Provider value={{ interviewInfo, setInterviewInfo }}>
      <div style={isStartPage ? { height: '100vh', overflow: 'hidden' } : {}}>
        {!isStartPage && <InterviewHeader />}
        {children}
      </div>
    </InterviewDataContext.Provider>
  )
}

export default layout
