import { Button } from '@/components/ui/button'
import React from 'react'
import CandidateFeedbackDialogue from './CandidateFeedbackDialogue'

function CandidatesList({CandidatesList}) {
  return (
    <div>
      <div className=''>
        <h2 className='font-bold my-5'>Candidates List: ({CandidatesList?.length || 0})</h2>
        
        {CandidatesList?.map((Candidate, index) => (
          <div key={index} className='p-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white rounded-lg shadow-md border mb-5'>
            <div className='flex items-center gap-5'>
              <h2 className='bg-blue-200 p-3 rounded-full h-10 w-10 flex items-center justify-center text-blue-800'>
                {Candidate?.userName?.[0] || '?'}
              </h2>
              <div>
                <h2 className='font-bold'>{Candidate?.userName || 'Unknown'}</h2>
              </div>
            </div>
            
            <div className='flex gap-3 items-center mt-3 sm:mt-0'>
              <h2 className='text-green-500 font-medium'>6/10</h2>
              <CandidateFeedbackDialogue Candidate={Candidate} />
             
            </div>
          </div>
        ))}
        
        {(!CandidatesList || CandidatesList.length === 0) && (
          <div className='p-5 bg-gray-50 rounded-lg text-gray-500 text-center'>
            No candidates available yet
          </div>
        )}
      </div>
    </div>
  )
}

export default CandidatesList