"use client"
import { useUser } from '@/app/provider';
import { Button } from '@/components/ui/button';
import { supabase } from '@/services/superbaseClient'
import { Video } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import InterviewCard from '../dashboard/_components/InterviewCard';

function ScheduledInterviews() {
    const {user} = useUser();
    const [interviewList, setInterviewList] = useState([]);
    
    useEffect(() => {
        user && GetInterviewList();
    }, [user])
    
    const GetInterviewList = async () => {
        const { data, error } = await supabase.from('Interviews')
        .select('jobPosition,duration,interview_id,interview-feedback(userEmail)')
        .eq('userEmail', user?.email)
        .order('id', {ascending: false})

        console.log('Supabase result:', data);
        
        if (data) {
            setInterviewList(data);
        } else {
            console.error('Error fetching interviews:', error);
            setInterviewList([]);
        }
    }
  
    return (
        <div className="mt-6">
            <h2 className="font-bold text-xl">InterviewList with Candidate Feedback</h2>
            {interviewList.length === 0 && 
                <div className="p-5 flex flex-col gap-3 items-center mt-5">
                    <Video className="h-10 w-10 text-blue-400"/>
                    <h2>You don't have any interviews scheduled.</h2>
                    <Button> + Create New Interview</Button>
                </div>
            }
            
            {interviewList.length > 0 &&
                <div className="grid grid-cols-2 mt-5 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {interviewList.map((interview, index) => (
                        <InterviewCard interview={interview} key={index}
                        viewDetail={true}/>
                    ))}
                </div>
            }
        </div>
    )
}

export default ScheduledInterviews