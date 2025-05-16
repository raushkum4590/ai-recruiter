import React from 'react';
import { CheckCircle } from 'lucide-react';

function InterviewCompleted() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="text-green-500" size={64} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Interview Completed Successfully!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for participating. Your responses have been recorded.
        </p>
       
      </div>
    </div>
  );
}

export default InterviewCompleted;