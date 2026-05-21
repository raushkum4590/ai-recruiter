"use client"
import { useUser } from '@/app/provider';
import { supabase } from '@/services/superbaseClient'
import { Video, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import InterviewCard from '../dashboard/_components/InterviewCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function ScheduledInterviews() {
    const { user } = useUser();
    const [interviewList, setInterviewList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        user && GetInterviewList();
    }, [user])

    const GetInterviewList = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('Interviews')
            .select('jobPosition,duration,interview_id,type,created_at,interview-feedback(userEmail)')
            .eq('userEmail', user?.email)
            .order('id', { ascending: false });

        if (data) setInterviewList(data);
        setLoading(false);
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>

                {/* Header */}
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8'>
                    <div>
                        <h1 className='text-3xl font-bold text-gray-900'>Scheduled Interviews</h1>
                        <p className='text-gray-500 mt-1'>View all interviews and candidate responses</p>
                    </div>
                    <Link href='/dashboard/create-interview'>
                        <Button className='bg-blue-600 hover:bg-blue-700 flex items-center gap-2'>
                            <Plus className='h-4 w-4' /> Create Interview
                        </Button>
                    </Link>
                </div>

                {/* Loading skeleton */}
                {loading && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className='bg-white rounded-xl p-6 border border-gray-100 animate-pulse'>
                                <div className='h-10 w-10 bg-gray-200 rounded-xl mb-4' />
                                <div className='h-5 bg-gray-200 rounded mb-2' />
                                <div className='h-4 bg-gray-200 rounded w-2/3 mb-4' />
                                <div className='h-9 bg-gray-200 rounded' />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && interviewList.length === 0 && (
                    <div className='bg-white rounded-2xl border border-gray-200 shadow-sm p-14 text-center'>
                        <div className='mx-auto h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mb-5'>
                            <Video className='h-10 w-10 text-blue-500' />
                        </div>
                        <h3 className='text-xl font-semibold text-gray-900 mb-2'>No interviews yet</h3>
                        <p className='text-gray-500 mb-6 max-w-sm mx-auto'>
                            Create your first AI-powered interview and start evaluating candidates.
                        </p>
                        <Link href='/dashboard/create-interview'>
                            <Button className='bg-blue-600 hover:bg-blue-700'>
                                <Plus className='h-4 w-4 mr-2' /> Create New Interview
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Grid */}
                {!loading && interviewList.length > 0 && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                        {interviewList.map((interview, index) => (
                            <InterviewCard interview={interview} key={index} viewDetail={true} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ScheduledInterviews
