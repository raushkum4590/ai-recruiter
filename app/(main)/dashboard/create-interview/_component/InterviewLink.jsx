import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, Copy, List, Mail, PlusIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

// Change this to accept props instead of function parameters
function InterviewLink({ interview_id, formData }) {
    const url = process.env.NEXT_PUBLIC_HOST_URL + '/' + interview_id;
    
    const GetInterviewUrl = () => {
        return url;
    };
    
    const onCopyLink = async () => {
        await navigator.clipboard.writeText(GetInterviewUrl());
        alert('Link Copied');
    };

    return (
        <div className='flex flex-col items-center w-full justify-center mt-10'>
            <Image src={'/check.png'} alt='check' width={200} height={200} className='w-[50px] h-[50px]'/>
            <h2 className='font-bold text-lg mt-4'>Your AI Interview is Ready!</h2>
            <p className='mt-3'>Share This Link with Candidates to start interview process</p>
            <div className='w-full p-7 mt-6 rounded-xl bg-white shadow-md'>
                <div className='flex justify-between items-center'>
                    <h2 className='font-bold'>Interview Link</h2>
                    <h2 className='p-1 px-2 text-blue-400 bg-blue-50 rounded-4xl'>valid for 30 Days</h2>
                </div>
                <div className='mt-3 flex gap-3 items-center'>
                    <Input defaultValue={GetInterviewUrl()} disabled={true}/>
                    <Button onClick={onCopyLink} className='text-blue-500 bg-blue-200 hover:bg-blue-300'><Copy/> Copy Link</Button>
                </div>
                <hr className='my-5'/>
                <div className='flex gap-5'>
                    <h2 className='text-gray-500 text-sm flex gap-2 items-center'><Clock className='h-4 w-4'/> {formData.duration || 30} min</h2>
                    <h2 className='text-gray-500 text-sm flex gap-2 items-center'><List className='h-4 w-4'/> {formData.questionList?.length || 10}</h2>
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