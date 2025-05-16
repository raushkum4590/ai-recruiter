import { Button } from '@/components/ui/button'
import { ArrowRight, Copy, Send } from 'lucide-react'
import moment from 'moment'
import Link from 'next/link'
import React from 'react'

function InterviewCard({interview, viewDetail=false}) {
    const url=process.env.NEXT_PUBLIC_HOST_URL+"/"+interview?.interview_id
      
    const copyLink=()=>{
     
      

        navigator.clipboard.writeText(url);
        alert('copied')
      }
      const onsend=()=>{
        window.location.href="mailto:account@tech.com?subject=Ai Reccruiter Interview Link && body=Interview Link:"+url
      }
  return (
    <div className='p-5 bg-white rounded-lg shadow-md border'>
        <div className='flex items-center justify-between'>
            <div className='h-[40px] w-[40px] bg-blue-200 rounded-full'>
            </div>
                <h2 className='text-sm'>{moment(interview?.created_at).format('DD MM YYYY')}</h2>

        </div>
        <h2 className='mt-3 font-bold text-lg'>{interview?.jobPosition}</h2>
        <h2 className='mt-2  flex justify-between text-gray-500'>{interview?.duration}
          <span>{interview['interview-feedback']?.length}Candidates</span>
        </h2>
        {!viewDetail?<div className='flex gap-3 w-auto mt-5'>
            <Button variant='outline' className={'w-auto'} onClick={copyLink}><Copy/>Copy Link</Button>
            <Button className={'w-auto'} onClick={onsend}><Send/>Send</Button>
        </div>
        :
        <Link href={'/scheduled-interviews/'+interview?.interview_id+"/details"}>
        <Button variant='outline' className='mt-5 w-full'>View Detail<ArrowRight/></Button>
        </Link>
}
    </div>
  )
}

export default InterviewCard