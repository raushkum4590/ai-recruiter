import React from 'react'
import CandidateFeedbackDialogue from './CandidateFeedbackDialogue'

function getOverallScore(candidate) {
  const r = candidate?.feedback?.feedback?.rating ?? {};
  const t = r.technicalSkills ?? r.techicalSkills ?? 0;
  const c = r.communication ?? 0;
  const p = r.problemSolving ?? 0;
  const e = r.experience ?? r.experince ?? 0;
  return Math.round((t + c + p + e) / 4);
}

function CandidatesList({ CandidatesList }) {
  return (
    <div>
      <h2 className='font-bold my-5 text-lg'>Candidates ({CandidatesList?.length || 0})</h2>

      {CandidatesList?.map((candidate, index) => {
        const score = getOverallScore(candidate);
        const recommended = candidate?.feedback?.feedback?.recommendation === 'Recommended'
          || candidate?.feedback?.feedback?.Recommendation === 'Recommended for Hire';
        const scoreColor = score >= 8 ? 'text-green-600' : score >= 5 ? 'text-yellow-600' : 'text-red-500';

        return (
          <div key={index} className='p-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white rounded-xl shadow-sm border mb-4 hover:shadow-md transition-shadow'>
            <div className='flex items-center gap-4'>
              <div className='bg-blue-100 text-blue-800 font-bold h-10 w-10 rounded-full flex items-center justify-center'>
                {candidate?.userName?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className='font-semibold text-gray-900'>{candidate?.userName || 'Unknown'}</p>
                <p className='text-sm text-gray-500'>{candidate?.userEmail || ''}</p>
              </div>
            </div>

            <div className='flex gap-4 items-center'>
              {candidate?.feedback?.feedback ? (
                <>
                  <span className={`text-lg font-bold ${scoreColor}`}>{score}/10</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${recommended ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {recommended ? 'Recommended' : 'Not Recommended'}
                  </span>
                </>
              ) : (
                <span className='text-xs text-gray-400'>Pending feedback</span>
              )}
              <CandidateFeedbackDialogue Candidate={candidate} />
            </div>
          </div>
        );
      })}

      {(!CandidatesList || CandidatesList.length === 0) && (
        <div className='p-8 bg-gray-50 rounded-xl text-gray-500 text-center border border-dashed'>
          No candidates have completed this interview yet.
        </div>
      )}
    </div>
  )
}

export default CandidatesList
