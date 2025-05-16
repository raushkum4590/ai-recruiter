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
    
    useEffect(() => {
        // Get the current window location when component mounts (client-side only)
        if (typeof window !== 'undefined') {
            try {
                // Make sure interview_id exists and is not undefined
                if (!interview_id) {
                    console.error('Interview ID is missing');
                    setIsUrlValid(false);
                    return;
                }
                
                // Determine deployment environment
                const hostname = window.location.hostname;
                const isVercel = hostname.includes('vercel.app');
                const isProduction = isVercel || !hostname.includes('localhost');
                
                setDeploymentType(isVercel ? 'Vercel' : (isProduction ? 'Production' : 'Local'));
                
                // Get origin - this should work for both localhost and Vercel
                const origin = window.location.origin;
                
                // Construct the URL ensuring no double slashes
                let interviewUrl = `${origin}/interview/${interview_id}`;
                
                // Normalize URL to remove any potential issues
                try {
                    const normalizedUrl = new URL(interviewUrl);
                    interviewUrl = normalizedUrl.toString();
                } catch (e) {
                    console.error('URL normalization error:', e);
                }
                
                setUrl(interviewUrl);
                
                // Log the URL for debugging
                console.log('Environment:', isVercel ? 'Vercel' : (isProduction ? 'Production' : 'Local'));
                console.log('Origin:', origin);
                console.log('Generated interview URL:', interviewUrl);
            } catch (error) {
                console.error('Error generating URL:', error);
                setIsUrlValid(false);
            }
        }
    }, [interview_id]);
    
    const onCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard');
        } catch (error) {
            console.error('Failed to copy link', error);
            toast.error('Failed to copy link');
        }
    };

    return (
        <div className='flex flex-col items-center w-full justify-center mt-10'>
            <Image src={'/check.png'} alt='check' width={200} height={200} className='w-[50px] h-[50px]'/>
            <h2 className='font-bold text-lg mt-4'>Your AI Interview is Ready!</h2>
            <p className='mt-3'>Share This Link with Candidates to start interview process</p>
            <div className='w-full p-7 mt-6 rounded-xl bg-white shadow-md'>
                <div className='flex justify-between items-center'>
                    <h2 className='font-bold'>Interview Link</h2>
                    <h2 className='p-1 px-2 text-blue-400 bg-blue-50 rounded-lg'>valid for 30 Days</h2>
                </div>                <div className='mt-3 flex gap-3 items-center'>
                    <Input value={url} disabled={true}/>
                    <Button onClick={onCopyLink} className='text-blue-500 bg-blue-200 hover:bg-blue-300'><Copy/> Copy Link</Button>
                </div>
                {!isUrlValid && (
                    <div className="mt-2 text-red-500 text-sm">
                        There might be an issue with this URL. Please verify it works correctly.
                    </div>
                )}                {deploymentType && (
                    <div className="mt-2 text-sm text-gray-500">
                        Environment detected: <span className="font-medium">{deploymentType}</span>
                    </div>
                )}
                
                {deploymentType === 'Vercel' && (
                    <div className="mt-2 text-blue-600 text-sm">
                        <p>Alternative direct link (if the regular link doesn't work):</p>
                        <div className="flex gap-3 items-center mt-1">
                            <Input 
                                value={`https://ai-recruiter-nu.vercel.app/interview/${interview_id}`} 
                                disabled={true}
                            />
                            <Button 
                                onClick={() => {
                                    navigator.clipboard.writeText(`https://ai-recruiter-nu.vercel.app/interview/${interview_id}`);
                                    toast.success('Direct link copied to clipboard');
                                }} 
                                className='text-blue-500 bg-blue-200 hover:bg-blue-300'>
                                <Copy/> Copy
                            </Button>
                        </div>
                    </div>
                )}
                
                <hr className='my-5'/>
                <div className='flex gap-5'>
                    <h2 className='text-gray-500 text-sm flex gap-2 items-center'><Clock className='h-4 w-4'/> {formData?.duration || 30} min</h2>
                    <h2 className='text-gray-500 text-sm flex gap-2 items-center'><List className='h-4 w-4'/> {formData?.questionList?.length || 10}</h2>
                </div>
            </div>
            <div className='mt-7 bg-white p-5 rounded-lg shadow-md w-full'>
                <h2 className='font-bold'>Share Via</h2>
                <div className='gap-5 flex mt-3'>
                    <Button variant={'outline'} className='ml-2'><Mail/>Email</Button>
                    <Button variant={'outline'} className='ml-2'><Mail/>Slack</Button>
                    <Button variant={'outline'} className='ml-2'><Mail/>LinkedIn</Button>
                </div>
            </div>
            <div className='flex w-full gap-5 justify-between mt-6'>
                <Link href={'/dashboard'}>
                    <Button variant={'outline'}><ArrowLeft/>Back To dashboard</Button>
                </Link>
                <Link href={'/create-interview'}>
                    <Button className='text-blue-500 bg-blue-200 hover:bg-blue-300'><PlusIcon/>Create New Interview</Button>
                </Link>
            </div>
        </div>
    );
}

export default InterviewLink;