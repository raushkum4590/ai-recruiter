import { Button } from '@/components/ui/button'
import { ArrowRight, Copy, Send, Calendar, Clock, Users, MoreVertical } from 'lucide-react'
import moment from 'moment'
import Link from 'next/link'
import React from 'react'
import { toast } from 'sonner'

function InterviewCard({interview, viewDetail=false}) {
    // Use the production URL for sharing
    const url = `https://ai-recruiter-nu.vercel.app/interview/${interview?.interview_id}`
      
    const copyLink = () => {
        navigator.clipboard.writeText(url);
        toast.success('Interview link copied to clipboard!');
    }
    
    const onSend = () => {
        const subject = encodeURIComponent(`AI Recruiter Interview - ${interview?.jobPosition}`);
        const body = encodeURIComponent(`Hello,

You have been invited to participate in an AI-powered interview for the position of ${interview?.jobPosition}.

Interview Details:
- Position: ${interview?.jobPosition}
- Duration: ${interview?.duration} minutes
- Questions: ${interview?.questionList?.length || 'Multiple'} questions

Please click the link below to start your interview:
${url}

Best regards,
AI Recruiter Team`);
        
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }

    const candidateCount = interview?.['interview-feedback']?.length || 0;
    const statusColor = candidateCount > 0 ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100';

    return (
        <div className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {moment(interview?.created_at).format('MMM DD, YYYY')}
                            </p>
                        </div>
                    </div>
                    <button className="p-1 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                </div>

                {/* Job Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {interview?.jobPosition}
                </h3>

                {/* Interview Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{interview?.duration} min</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                        {candidateCount} {candidateCount === 1 ? 'Candidate' : 'Candidates'}
                    </div>
                </div>

                {/* Interview Type Badge */}
                <div className="mb-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                        {interview?.type || 'AI Interview'}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6">
                {!viewDetail ? (
                    <div className="grid grid-cols-2 gap-3">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={copyLink}
                            className="flex items-center justify-center space-x-1 hover:bg-gray-50"
                        >
                            <Copy className="h-3 w-3" />
                            <span className="text-xs">Copy</span>
                        </Button>
                        <Button 
                            size="sm"
                            onClick={onSend}
                            className="flex items-center justify-center space-x-1 bg-blue-600 hover:bg-blue-700"
                        >
                            <Send className="h-3 w-3" />
                            <span className="text-xs">Send</span>
                        </Button>
                    </div>
                ) : (
                    <Link href={`/scheduled-interviews/${interview?.interview_id}/details`}>
                        <Button 
                            variant="outline" 
                            className="w-full flex items-center justify-center space-x-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                        >
                            <span>View Details</span>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                )}
            </div>

            {/* Progress Bar (if candidates have taken the interview) */}
            {candidateCount > 0 && (
                <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-20 group-hover:opacity-40 transition-opacity"></div>
            )}
        </div>
    )
}

export default InterviewCard