import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { BadgeCheck, XCircle } from 'lucide-react';

function ScoreBar({ label, value }) {
  const score = value ?? 0;
  const color = score >= 8 ? 'text-green-600' : score >= 5 ? 'text-yellow-600' : 'text-red-500';
  const barColor = score >= 8 ? 'bg-green-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className={`font-semibold ${color}`}>{score}/10</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${score * 10}%` }} />
      </div>
    </div>
  );
}

function CandidateFeedbackDialogue({ Candidate }) {
  const feedback = Candidate?.feedback?.feedback;
  const rating = feedback?.rating ?? {};

  // Support both old (typo) and new field names
  const technicalSkills = rating.technicalSkills ?? rating.techicalSkills ?? 0;
  const communication   = rating.communication ?? 0;
  const problemSolving  = rating.problemSolving ?? 0;
  const experience      = rating.experience ?? rating.experince ?? 0;

  const overall = Math.round((technicalSkills + communication + problemSolving + experience) / 4);
  const recommended = feedback?.recommendation === 'Recommended' || feedback?.Recommendation === 'Recommended for Hire';

  const overallColor = overall >= 8 ? 'text-green-600' : overall >= 5 ? 'text-yellow-600' : 'text-red-500';
  const overallBg    = overall >= 8 ? 'bg-green-50 border-green-200' : overall >= 5 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="whitespace-nowrap">View Feedback</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Interview Feedback</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-5">
          {/* Candidate header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-800 font-bold h-10 w-10 rounded-full flex items-center justify-center text-lg">
                {Candidate?.userName?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{Candidate?.userName}</p>
                <p className="text-xs text-gray-500">{Candidate?.userEmail}</p>
              </div>
            </div>
            {feedback && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-medium ${recommended ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                {recommended ? <BadgeCheck className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {recommended ? 'Recommended' : 'Not Recommended'}
              </div>
            )}
          </div>

          {feedback ? (
            <>
              {/* Overall score */}
              <div className={`rounded-xl border p-4 text-center ${overallBg}`}>
                <p className="text-sm text-gray-500 mb-1">Overall Score</p>
                <p className={`text-4xl font-bold ${overallColor}`}>{overall}<span className="text-lg text-gray-400">/10</span></p>
              </div>

              {/* Skill bars */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">Skills Assessment</h3>
                <ScoreBar label="Technical Skills" value={technicalSkills} />
                <ScoreBar label="Communication"    value={communication} />
                <ScoreBar label="Problem Solving"  value={problemSolving} />
                <ScoreBar label="Experience"       value={experience} />
              </div>

              {/* Summary */}
              {(feedback.summary || feedback.summery) && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Summary</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{feedback.summary ?? feedback.summery}</p>
                </div>
              )}

              {/* Recommendation message */}
              {(feedback.recommendationMsg || feedback.RecommendationMsg) && (
                <div className={`rounded-xl p-4 border ${recommended ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                  <h3 className="font-semibold text-gray-800 mb-1">Hiring Decision</h3>
                  <p className="text-sm text-gray-700">{feedback.recommendationMsg ?? feedback.RecommendationMsg}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500 py-6">No feedback data available yet.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CandidateFeedbackDialogue;
