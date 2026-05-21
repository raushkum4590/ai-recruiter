"use client"
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import FormField from './_component/FormField'
import QuestionList from './_component/QuestionList'
import { toast } from 'sonner'
import InterviewLink from './_component/InterviewLink'
import { Button } from '@/components/ui/button'

const STEPS = [
    { label: 'Details', desc: 'Job info & type' },
    { label: 'Questions', desc: 'AI-generated' },
    { label: 'Share', desc: 'Copy & send link' },
]

function CreateInterview() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({});
    const [interviewId, setInterviewId] = useState();

    const onHandleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const onGoToNext = () => {
        if (!formData?.jobPosition || !formData.jobDescription || !formData.duration || !formData.type) {
            toast("Please fill all the fields");
            return;
        }
        setStep(step + 1);
    };

    const onCreateLink = (interview_id) => {
        if (!interview_id) {
            toast.error('Failed to create interview link');
            return;
        }
        setInterviewId(interview_id);
        setStep(step + 1);
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
            <div className='max-w-3xl mx-auto px-4 py-10'>

                {/* Back + Title */}
                <div className='flex items-center gap-3 mb-8'>
                    <button
                        onClick={() => router.back()}
                        className='p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm transition-all'
                    >
                        <ArrowLeft className='h-5 w-5 text-gray-600' />
                    </button>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-900'>Create Interview</h1>
                        <p className='text-sm text-gray-500'>Set up an AI-powered interview in minutes</p>
                    </div>
                </div>

                {/* Step indicator */}
                <div className='flex items-center mb-10'>
                    {STEPS.map((s, i) => {
                        const num = i + 1;
                        const done = step > num;
                        const active = step === num;
                        return (
                            <React.Fragment key={i}>
                                <div className='flex items-center gap-3'>
                                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                                        ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'}`}>
                                        {done ? <CheckCircle className='h-5 w-5' /> : num}
                                    </div>
                                    <div className='hidden sm:block'>
                                        <p className={`text-sm font-semibold ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-gray-400'}`}>{s.label}</p>
                                        <p className='text-xs text-gray-400'>{s.desc}</p>
                                    </div>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-4 rounded-full ${step > num ? 'bg-green-400' : 'bg-gray-200'}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Step content */}
                {step === 1 && <FormField onHandleInputChange={onHandleInputChange} GoToNext={onGoToNext} />}
                {step === 2 && <QuestionList formData={formData} onCreateLink={onCreateLink} />}
                {step === 3 && interviewId && <InterviewLink interview_id={interviewId} formData={formData} />}
                {step === 3 && !interviewId && (
                    <div className="p-8 bg-red-50 rounded-2xl border border-red-200 text-center">
                        <h3 className="text-lg font-bold text-red-600 mb-2">Something went wrong</h3>
                        <p className="text-gray-600 mb-5">The interview ID is missing. Please try again.</p>
                        <div className='flex gap-3 justify-center'>
                            <Button onClick={() => setStep(2)} variant='outline'>Go Back</Button>
                            <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CreateInterview
