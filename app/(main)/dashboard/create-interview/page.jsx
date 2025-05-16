"use client"
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
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
    const[interviewId, setInterviewId] = useState();
    
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
    };

    const onCreateLink = (interview_id) => {
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
            <div>
                {step == 1 ? (
                    <FormField 
                        onHandleInputChange={onHandleInputChange} 
                        GoToNext={onGoToNext} 
                    />
                ) : step == 2 ? (
                    <QuestionList formData={formData} onCreateLink={(interview_id)=>onCreateLink(interview_id)}  />
                    ) : step == 3 ? (<InterviewLink interview_id={interviewId}
                    formData={formData} />) : null}
           
            </div>
        </div>
    )
}

export default CreateInterview