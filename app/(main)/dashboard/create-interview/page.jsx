"use client"
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { Progress } from "@/components/ui/progress"
import FormField from './_component/FormField'
import QuestionList from './_component/QuestionList'
import { toast } from 'sonner'
import InterviewLink from './_component/InterviewLink'
import { useUser } from '@/app/provider't"
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { Progress } from "@/components/ui/progress"
import FormField from './_component/FormField'
import QuestionList from './_component/QuestionList'
import { toast } from 'sonner'
import InterviewLink from './_component/InterviewLink'
import { useUser } from '@/app/provider'

function CreateInterview() {
    const router = useRouter();
    const { user } = useUser();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({});
    const [interviewId, setInterviewId] = useState();
    const [debugInfo, setDebugInfo] = useState({});
    
    // Log debug info whenever interview ID changes
    useEffect(() => {
        if (interviewId) {
            const info = {
                interviewId,
                environment: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
                timestamp: new Date().toISOString()
            };
            console.log('Interview creation debug info:', info);
            setDebugInfo(info);
        }
    }, [interviewId]);
    
    const onHandleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        console.log(formData);
    };
    
    const onGoToNext = () => {
       
        if(!formData?.jobPosition || !formData.jobDescription || !formData.duration || !formData.type) {
          toast("Please fill all the fields")
          return;
        }
        setStep(step + 1);
    };    const onCreateLink = (interview_id) => {
        if (!interview_id) {
            console.error('Received invalid interview ID');
            toast.error('Failed to create interview link - no ID received');
            return;
        }
        
        console.log('Creating link with interview_id:', interview_id);
        
        setInterviewId(interview_id);
        setStep(step + 1);
    }

    return (
        <div className='mt-10 px-10 md:px-24 lg:px-44 xl:px-56'>
            <div className='flex gap-5 items-center'>
                <ArrowLeft onClick={() => router.back()} className='cursor-pointer'/>
                <h2 className='text-2xl font-bold my-3'>Create Interview</h2>
            </div>
            <Progress value={step * 33.33} className='my-5' />
            <div>                {step == 1 ? (
                    <FormField 
                        onHandleInputChange={onHandleInputChange} 
                        GoToNext={onGoToNext} 
                    />
                ) : step == 2 ? (
                    <QuestionList formData={formData} onCreateLink={(id) => onCreateLink(id)} />
                ) : step == 3 && interviewId ? (
                    <InterviewLink interview_id={interviewId} formData={formData} />
                ) : step == 3 ? (
                    <div className="p-6 bg-red-50 rounded-lg text-center">
                        <h3 className="text-lg font-bold text-red-600 mb-2">Error Creating Interview Link</h3>
                        <p className="text-gray-700 mb-4">There was a problem generating the interview link. The interview ID is missing.</p>
                        <Button onClick={() => setStep(2)} className="mr-2">Go Back</Button>
                        <Button onClick={() => router.push('/dashboard')} variant="outline">Return to Dashboard</Button>
                    </div>
                ) : null}
           
            </div>
        </div>
    )
}

export default CreateInterview