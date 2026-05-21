import { CheckCircle, Clock, MessageSquare } from 'lucide-react';

export default function InterviewCompleted() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-5">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle className="text-green-500 w-14 h-14" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Interview Complete!</h1>
        <p className="text-gray-500 mb-8">
          Great job! Your responses have been recorded and your feedback report is being generated.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-50 rounded-xl p-4 flex flex-col items-center gap-2">
            <Clock className="text-blue-500 w-6 h-6" />
            <p className="text-sm text-gray-600 font-medium">Report Ready In</p>
            <p className="font-bold text-gray-900">~1 min</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 flex flex-col items-center gap-2">
            <MessageSquare className="text-purple-500 w-6 h-6" />
            <p className="text-sm text-gray-600 font-medium">Feedback</p>
            <p className="font-bold text-gray-900">AI Scored</p>
          </div>
        </div>

        <p className="text-sm text-gray-400">
          The recruiter will review your AI-generated feedback report and be in touch soon.
        </p>
      </div>
    </div>
  );
}
