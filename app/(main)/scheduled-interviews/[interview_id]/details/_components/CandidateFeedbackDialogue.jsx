import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";

function CandidateFeedbackDialogue({ Candidate }) {
  const feedback = Candidate?.feedback?.feedback;
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' className='whitespace-nowrap'>View Feedback</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Candidate Feedback</DialogTitle>
        </DialogHeader>
        
        <div className='mt-5'>
          <div className='flex justify-between items-center mb-4'>
            <div className='flex items-center gap-3'>
              <div className='bg-blue-200 p-3 rounded-full h-10 w-10 flex items-center justify-center text-blue-800'>
                {Candidate?.userName?.[0]}
              </div>
              <div>
                <h2 className='font-bold'>{Candidate?.userName}</h2>
              </div>
            </div>
            
            <div className='flex gap-2 items-center'>
              <span className={`font-medium ${feedback?.Recommendation === 'Not Recommended for Hire' ? 'text-red-500' : 'text-green-500'}`}>
                {feedback?.Recommendation || 'No recommendation'}
              </span>
            </div>
          </div>
          
          <div className="mt-6">
            <h2 className='font-bold text-lg mb-3'>Skills Assessment</h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <div className='flex justify-between text-sm mb-1'>
                  <span>Technical Skills</span>
                  <span>{feedback?.rating?. techicalSkills || 0}/10</span>
                </div>
                <Progress value={(feedback?.rating?. techicalSkills || 0) * 10} className='h-2' />
              </div>
              
              <div>
                <div className='flex justify-between text-sm mb-1'>
                  <span>Communication</span>
                  <span>{feedback?.rating?.communication || 0}/10</span>
                </div>
                <Progress value={(feedback?.rating?.communication || 0) * 10} className='h-2' />
              </div>
              
              <div>
                <div className='flex justify-between text-sm mb-1'>
                  <span>Problem Solving</span>
                  <span>{feedback?.rating?.problemSolving || 0}/10</span>
                </div>
                <Progress value={(feedback?.rating?.problemSolving || 0) * 10} className='h-2' />
              </div>
              
              <div>
                <div className='flex justify-between text-sm mb-1'>
                  <span>Experience</span>
                  <span>{feedback?.rating?.experince || 0}/10</span>
                </div>
                <Progress value={(feedback?.rating?.experince || 0) * 10} className='h-2' />
              </div>
            </div>
          </div>
          
          {feedback?.summery && (
            <div className="mt-6">
              <h2 className='font-bold text-lg mb-2'>Summary</h2>
              <p className="text-gray-700">{feedback.summery}</p>
            </div>
          )}
          
          {feedback?.RecommendationMsg && (
            <div className="mt-4">
              <h2 className='font-bold text-lg mb-2'>Recommendation Details</h2>
              <p className="text-gray-700">{feedback.RecommendationMsg}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CandidateFeedbackDialogue;