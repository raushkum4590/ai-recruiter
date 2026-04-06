'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, Copy, List, Mail, PlusIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

function InterviewLink({ interview_id, formData }) {
    const [url, setUrl] = useState('');
    const [isUrlValid, setIsUrlValid] = useState(true);
    const [deploymentType, setDeploymentType] = useState('');
    
    // Function to generate a valid production URL
    const getProductionUrl = (id) => {
        // ALWAYS use the hardcoded production URL
        return `https://ai-recruiter-nu.vercel.app/interview/${id}`;
    };
    
    useEffect(() => {
        console.log('InterviewLink component received interview_id:', interview_id);
        
        // Get the current window location when component mounts (client-side only)
        if (typeof window !== 'undefined') {
            try {
                // Make sure interview_id exists and is not undefined
                if (!interview_id) {
                    console.error('Interview ID is missing');
                    setIsUrlValid(false);
                    return;
                }
                
                // ALWAYS use the production URL - NO EXCEPTIONS
                const interviewUrl = getProductionUrl(interview_id);
                setUrl(interviewUrl);
                
                setDeploymentType(isVercel ? 'Vercel' : (isProduction ? 'Production' : 'Local'));
                
                setUrl(interviewUrl);
                
                // Log the URL for debugging
                console.log('Environment:', isVercel ? 'Vercel' : (isProduction ? 'Production' : 'Local'));
                console.log('Generated interview URL:', interviewUrl);
            } catch (error) {
                console.error('Error generating URL:', error);
                setIsUrlValid(false);
            }
        }
    }, [interview_id]);    const onCopyLink = async () => {
        try {
            // Always copy the production URL
            const productionUrl = getProductionUrl(interview_id);
            await navigator.clipboard.writeText(productionUrl);
            toast.success('Link copied to clipboard');
        } catch (error) {
            console.error('Failed to copy link', error);
            toast.error('Failed to copy link');
        }
    };

    return (
        <div className='flex flex-col items-center w-full justify-center mt-10 max-w-4xl mx-auto'>
            {/* Success Header */}
            <div className="text-center mb-8">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Image src={'/check.png'} alt='check' width={40} height={40} className='w-10 h-10'/>
                </div>
                <h2 className='text-3xl font-bold text-gray-900 mb-2'>Your AI Interview is Ready!</h2>
                <p className='text-lg text-gray-600'>Share this link with candidates to start the interview process</p>
            </div>

            {/* Main Interview Link Card */}
            <div className='w-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8'>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                    <div className='flex justify-between items-center'>
                        <h3 className='text-xl font-bold'>Interview Link</h3>
                        <span className='px-3 py-1 bg-white bg-opacity-20 text-white text-sm rounded-full border border-white border-opacity-30'>
                            Valid for 30 Days
                        </span>
                    </div>
                </div>

                {/* Link Section */}
                <div className="p-6">
                    <div className='flex gap-3 items-center mb-4'>
                        <Input 
                            value={getProductionUrl(interview_id)} 
                            disabled={true}
                            className="bg-gray-50 border-gray-200 text-gray-700 font-mono text-sm"
                        />
                        <Button 
                            onClick={onCopyLink} 
                            className='bg-blue-600 hover:bg-blue-700 text-white px-6 whitespace-nowrap'>
                            <Copy className="h-4 w-4 mr-2" /> 
                            Copy Link
                        </Button>
                    </div>

                    {!isUrlValid && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">⚠️ There might be an issue with this URL. Please verify it works correctly.</p>
                        </div>
                    )}
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-blue-800 text-sm font-medium mb-2">📋 Share this official interview link:</p>
                        <p className="text-blue-700 text-sm">Send this link directly to candidates via email, messaging platforms, or your preferred communication method.</p>
                    </div>

                    {/* Interview Details */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Clock className='h-4 w-4 text-blue-600' />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Duration</p>
                                <p className="font-semibold text-gray-900">{formData?.duration || 30} min</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <List className='h-4 w-4 text-green-600' />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Questions</p>
                                <p className="font-semibold text-gray-900">{formData?.questionList?.length || 10}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Options */}
            <div className='w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8'>
                <h3 className='text-lg font-bold text-gray-900 mb-4'>Share Via</h3>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                    <Button 
                        variant={'outline'} 
                        className='flex items-center justify-center space-x-2 p-4 h-auto hover:bg-blue-50 hover:border-blue-200'>
                        <Mail className="h-5 w-5 text-blue-600" />
                        <span>Email</span>
                    </Button>
                    <Button 
                        variant={'outline'} 
                        className='flex items-center justify-center space-x-2 p-4 h-auto hover:bg-green-50 hover:border-green-200'>
                        <Mail className="h-5 w-5 text-green-600" />
                        <span>Slack</span>
                    </Button>
                    <Button 
                        variant={'outline'} 
                        className='flex items-center justify-center space-x-2 p-4 h-auto hover:bg-indigo-50 hover:border-indigo-200'>
                        <Mail className="h-5 w-5 text-indigo-600" />
                        <span>LinkedIn</span>
                    </Button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row w-full gap-4 justify-between'>
                <Link href={'/dashboard'} className="flex-1">
                    <Button variant={'outline'} className="w-full flex items-center justify-center space-x-2 p-4 h-auto">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back To Dashboard</span>
                    </Button>
                </Link>
                <Link href={'/dashboard/create-interview'} className="flex-1">
                    <Button className='w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2 p-4 h-auto'>
                        <PlusIcon className="h-4 w-4" />
                        <span>Create New Interview</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default InterviewLink;