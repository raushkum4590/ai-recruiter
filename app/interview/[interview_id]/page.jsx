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
  const { interview_id } = useParams()
  console.log(interview_id)
  const [interviewData, setInterviewData] = useState()
  const[userName, setUserName] = useState('');
  const[loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const{interviewInfo, setInterviewInfo} = useContext(InterviewDataContext);
  
  const router =useRouter();
  useEffect(() => {
    interview_id&&GetInterviewDetail()
  }, [interview_id])
  const GetInterviewDetail=async ()=>{
    setLoading(true)
    try{
    let { data: Interviews, error } = await supabase
  .from('Interviews')
  .select("jobPosition,jobDescription,duration,type")
  .eq('interview_id', interview_id);
   setInterviewData(Interviews[0])
   setLoading(false)
   if(Interviews?.length ==0){
    alert('interview not found')
    return;
   }
    }catch (e) {
   setLoading(false)
   alert('incorrect interview id')
    }


  }
  const onJoinInterview=async()=>{
  setLoading(true)
    let { data: Interviews, error } = await supabase
  .from('Interviews')
  .select('*')
  .eq('interview_id', interview_id);;
  console.log(Interviews[0]);
  setInterviewInfo({
    userName:userName,
    userEmail:userEmail,
    interviewData:Interviews[0]
  });
  router.push('/interview/'+interview_id+'/start')
  setLoading(false)
  }

  return (
    <div className='px-10 md:px-28 lg:px-48 xl:px-64 mt-16 p-7 mb-20'>
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
    </div>
  )
}

export default Interview
