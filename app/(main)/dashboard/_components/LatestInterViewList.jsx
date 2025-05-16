"use client"
import { useUser } from '@/app/provider'
import { Button } from '@/components/ui/button'
import { supabase } from '@/services/superbaseClient'
import { Camera, Video } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import InterviewCard from './InterviewCard'

function LatestInterViewList() {
    const [interviewList, setInterviewList] = useState([])
    const {user}=useUser();

    useEffect(()=>{
      user && GetInterviewList();
    }, [user])
    const GetInterviewList=async()=>{
      let { data: Interviews, error } = await supabase
      .from('Interviews')
      .select('*')
      .eq('userEmail', user?.email)
      .order('id',{ascending:false})
      .limit(8)
    
      console.log(Interviews);

      setInterviewList(Interviews);

    }

   
  return (
    <div className='my-5'> 
        <h2 className='text-3xl font-bold'>Previously Created Interview</h2>
        {interviewList?.length === 0 && 
        <div className='p-5 flex flex-col gap-3 items-center mt-5'>
            <Video className='h-10 w-10 text-blue-400'/>
            <h2>You don't have any interviews scheduled.</h2>
            <Button> + Create New Interview</Button>

            </div>}
            {interviewList&&
            <div className='grid grid-cols-2 mt-5 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
              {interviewList.map((interview, index) =>(
                <InterviewCard interview={interview} key={index}/>
              ))}
              </div>
            }

    </div>
  )
}

export default LatestInterViewList