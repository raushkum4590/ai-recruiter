"use client"
import React, { useContext, useEffect, useState } from 'react'

import Image from 'next/image'
import { Clock, Info, Loader2, Video } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/services/superbaseClient'
import { InterviewDataContext } from '@/context/InterViewDataContext'

function Interview() {  
  const { interview_id } = useParams();
  console.log('Interview ID from params:', interview_id);
  const [interviewData, setInterviewData] = useState();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const {interviewInfo, setInterviewInfo} = useContext(InterviewDataContext);
  const [error, setError] = useState('');
  
  const router = useRouter();
  
  useEffect(() => {
    // Validate interview_id format and presence
    if (!interview_id) {
      console.error('Interview ID is missing or invalid');
      setError('Interview ID is missing or invalid');
      return;
    }
    
    console.log('Current URL:', typeof window !== 'undefined' ? window.location.href : 'Server-side rendering');
    GetInterviewDetail();
  }, [interview_id]);
  
  const GetInterviewDetail = async () => {
    setLoading(true);
    try {
      console.log('Fetching interview details for ID:', interview_id);
      
      // Validate interview_id format before querying
      if (!interview_id || interview_id === 'undefined') {
        throw new Error('Invalid interview ID format');
      }
      
      let { data: Interviews, error: dbError } = await supabase
        .from('Interviews')
        .select("jobPosition,jobDescription,duration,type")
        .eq('interview_id', interview_id);
        
      console.log('Query result:', { Interviews, dbError });
      
      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to fetch interview details');
      }
      
      if (!Interviews || Interviews.length === 0) {
        console.error('Interview not found for ID:', interview_id);
        setError('Interview not found. Please check the URL and try again.');
        setLoading(false);
        return;
      }
      
      setInterviewData(Interviews[0]);
      setLoading(false);
    } catch (e) {
      console.error('Error in GetInterviewDetail:', e.message);
      setError(e.message || 'An error occurred while fetching interview details');
      setLoading(false);
    }
  };
    const onJoinInterview=async()=>{
    setLoading(true);
    try {
      console.log('Joining interview with ID:', interview_id);
      
      // Validate inputs
      if (!userName.trim()) {
        throw new Error('Please enter your name');
      }
      
      if (!userEmail.trim()) {
        throw new Error('Please enter your email');
      }
      
      if (!interview_id) {
        throw new Error('Invalid interview ID');
      }
      
      let { data: Interviews, error } = await supabase
        .from('Interviews')
        .select('*')
        .eq('interview_id', interview_id);
        
      console.log('Interview data for joining:', Interviews?.[0]);
      
      if (error) {
        console.error('Error fetching interview data:', error);
        throw new Error('Failed to fetch interview data');
      }
      
      if (!Interviews || Interviews.length === 0) {
        throw new Error('Interview not found');
      }
      
      // Set user info in context
      setInterviewInfo({
        userName: userName,
        userEmail: userEmail,
        interviewData: Interviews[0]
      });
      
      // Navigate to the start page with proper URL construction
      const startUrl = `/interview/${interview_id}/start`;
      console.log('Navigating to:', startUrl);
      router.push(startUrl);
    } catch (error) {
      console.error('Error in joining interview:', error.message);
      alert(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='px-10 md:px-28 lg:px-48 xl:px-64 mt-16 p-7 mb-20'>
      {error ? (
        <div className='flex flex-col items-center justify-center border rounded-lg bg-white shadow-md p-6'>
          <Image src='/logo.svg' alt='logo' width={200} height={100} className='w-[140px]' />
          <div className="my-8 text-center">
            <h2 className='font-bold text-red-500 text-xl mb-3'>Error</h2>
            <p className="text-gray-700">{error}</p>
            <p className="mt-4 text-gray-500">The interview link appears to be invalid. Please contact the interviewer for a valid link.</p>
          </div>
          <Button 
            onClick={() => router.push('/')} 
            className='mt-4 bg-blue-500 text-white hover:bg-blue-600'>
            Return to Home
          </Button>
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center border rounded-lg bg-white shadow-md lg:px-33 xl:px-52 p-6'>
        
        <Image src='/logo.svg' alt='logo' width={200} height={100} className='w-[140px]' /> 

        <h2 className='mt-3 text-lg font-medium text-gray-700'>AI Powered Interview Platform</h2>

        <Image src='/inter.png' alt='interview' width={500} height={500} className='w-[280px] my-6' />

        <h2 className='font-bold text-xl'>{interviewData?.jobPosition}</h2>

        <div className='flex items-center gap-2 text-gray-500 mt-3'>
          <Clock className='w-4 h-4' />
          <span>{interviewData?.duration} </span>
        </div>

        <div className='w-full mt-6'>
          <h3 className='text-sm font-medium mb-2'>Enter Your Name</h3>
          <Input placeholder='e.g. John Doe' onChange={(event) => setUserName(event.target.value)} />
        </div>
        <div className='w-full mt-6'>
          <h3 className='text-sm font-medium mb-2'>Enter Your Email</h3>
          <Input placeholder='e.g. John@gmail.com' onChange={(event) => setUserEmail(event.target.value)} />
        </div>

        <div className='w-full mt-6 bg-gray-50 border p-4 rounded-md'>
          <div className='flex items-center gap-2 text-blue-500 font-semibold mb-2'>
            <Info className='w-4 h-4' />
            <span>Before You Begin</span>
          </div>
          <ul className='list-disc list-inside text-sm text-gray-700 space-y-1'>
            <li>Ensure you have a stable internet connection</li>
            <li>Have your resume ready for reference</li>
            <li>Be in a quiet and well-lit environment</li>
          </ul>
        </div>
        <Button
        disabled={loading || !userName}
        onClick={() => onJoinInterview()}
         className='flex items-center gap-2 mt-5 font-bold'><Video className='w-4 h-4' />{loading&&<Loader2/>}Join Interview</Button>

      </div>
      )}
    </div>
  )
}

export default Interview
