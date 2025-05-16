"use client"
import { useUser } from '@/app/provider';
import { supabase } from '@/services/superbaseClient';
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import JobDetail from './_components/JobDetail';
import CandidatesList from './_components/CandidatesList';

function InterviewDetail() {
    const { interview_id } = useParams();
    const { user } = useUser();
    const [interviewDetail, setInterviewDetail] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            GetInterViewDetail();
        }
    }, [user, interview_id]);

    const GetInterViewDetail = async () => {
        try {
            setLoading(true);
            const result = await supabase
                .from('Interviews')
                .select(`
                    jobPosition,
                    jobDescription,
                    type,
                    questionList,
                    duration,
                    interview_id,
                  interview-feedback(userEmail, userName, feedback)
                `)
                .eq('userEmail', user?.email)
                .eq('interview_id', interview_id);

            console.log(result);

            if (result.error) {
                throw new Error(result.error.message);
            }

            if (!result.data || result.data.length === 0) {
                setError("No interview found");
                setInterviewDetail({});
            } else {
                setInterviewDetail(result.data[0]);
            }
        } catch (err) {
            console.error("Error fetching interview details:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-4">
            <h2 className='font-bold text-2xl mb-4'>Interview Detail</h2>
            {loading && <p>Loading interview details...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {!loading && !error && Object.keys(interviewDetail).length > 0 && (
                <JobDetail interviewDetail={interviewDetail} />
            )}
            
            <div className="mt-6">
                <CandidatesList CandidatesList={interviewDetail?.['interview-feedback']} />
            </div>
        </div>
    )
}

export default InterviewDetail