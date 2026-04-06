'use client';

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Loader, Loader2 } from 'lucide-react';
import { supabase } from '@/services/superbaseClient';
import { useUser } from '@/app/provider';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function QuestionList({ formData, onCreateLink }) {
  const [loading, setLoading] = useState(true);
  const [questionList, setQuestionList] = useState([]);
  const { user } = useUser();
  const [saveLoading, setSaveLoading] = useState(false);
  const [apiWarning, setApiWarning] = useState('');

  useEffect(() => {
    if (formData && formData.jobPosition && formData.jobDescription && formData.duration && formData.type) {
      generateQuestionList();
    } else {
      setLoading(false);
    }
  }, [formData]);
  
  const generateQuestionList = async () => {
    setLoading(true);
    setApiWarning('');
    
    // Log what we're sending - stringify to see exact format
    console.log('[QuestionList] formData:', JSON.stringify(formData, null, 2));
    console.log('[QuestionList] formData types:', {
      jobPosition: typeof formData.jobPosition,
      jobDescription: typeof formData.jobDescription,
      duration: typeof formData.duration,
      type: typeof formData.type
    });
    
    try {
      const res = await axios.post('/api/ai-model', formData);
      console.log('API Response:', res.data);
      
      let raw = res.data.questions || res.data.question;
      let parsed = [];
  
      // Handle the new plain text format (array of strings)
      if (Array.isArray(raw)) {
        // Each item is a plain text question string
        parsed = raw.map((questionText, index) => ({
          question: questionText,
          type: 'General' // Default type since we're using plain text
        }));
      } else if (typeof raw === 'string') {
        // Single question as string
        parsed = [{ question: raw, type: 'General' }];
      } else {
        // Fallback - empty array
        console.warn('Unexpected question format received:', raw);
        parsed = [];
      }
  
      console.log('Parsed questions:', parsed);
      setQuestionList(parsed);
      
      // Show warning if API used fallback
      if (res.data.warning) {
        setApiWarning(res.data.warning);
        console.warn('API Warning:', res.data.warning);
      }
    } catch (e) {
      console.error('Error fetching questions:', e.response?.data || e.message);
      
      // Extract error message from response
      const errorData = e.response?.data;
      const errorMsg = errorData?.error || e.message;
      
      // Try to extract and use fallback questions from error response
      if (e.response?.data?.questions) {
        const parsed = e.response.data.questions.map((q) => ({
          question: typeof q === 'string' ? q : q.question,
          type: 'General'
        }));
        setQuestionList(parsed);
        setApiWarning('Using fallback questions due to API issue');
      } else if (e.response?.status === 400) {
        // Validation error - show message and use fallback
        console.warn('Validation error:', errorMsg);
        setApiWarning(`Form validation error: ${errorMsg}`);
        setQuestionList([]);
        toast.error(`Form error: ${errorMsg}`);
      } else {
        // Network or server error - fall back to defaults
        setQuestionList([]);
        setApiWarning('Failed to generate questions. Please try again.');
        toast.error('Failed to generate interview questions');
      }
    } finally {
      setLoading(false);
    }
  };
  const onFinish = async () => {
    setSaveLoading(true);
    try {
      // Generate a UUID for the interview
      const interview_id = uuidv4();
      console.log('Generated interview_id:', interview_id);
      
      if (!interview_id || interview_id.length < 10) {
        throw new Error('Invalid interview ID generated');
      }

      // Insert into database - save only the question text as plain strings
      const plainTextQuestions = questionList.map(item => item.question);
      
      const { data, error } = await supabase
        .from('Interviews')
        .insert([
          { 
            ...formData,
            questionList: plainTextQuestions, // Save as plain text array
            userEmail: user?.email,
            interview_id: interview_id
          },
        ])
        .select();
        
      if (error) {
        console.error('Database error:', error);
        throw new Error('Failed to save interview');
      }
      
      console.log('Interview saved successfully:', data);
      
      // Call the parent component with the interview ID
      onCreateLink(interview_id);
    } catch (error) {
      console.error('Error in onFinish:', error);
      toast.error('Failed to create interview link');
    } finally {
      setSaveLoading(false);
    }
  };
  

  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      {loading ? (
        <div className="p-5 bg-blue-50 rounded-xl shadow-md flex flex-col items-center">
          <Loader className="h-10 w-10 animate-spin text-blue-500" />
          <h2 className="mt-2 font-semibold text-blue-600">
            Generating Interview Questions
          </h2>
          <p className="text-gray-400">
            Please wait while we generate the questions...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {apiWarning && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-sm text-yellow-800">
                ℹ️ {apiWarning}
              </p>
            </div>
          )}
          {questionList.length > 0 ? (
            questionList.map((item, idx) => {
              const isFirst = idx === 0;
              return (
                <div
                  key={idx}
                  className={`
                    p-4 rounded-xl border shadow-sm
                    ${isFirst
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200'}
                  `}
                >
                  <p className="whitespace-pre-wrap leading-snug text-gray-900">
                    {item.question}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                     {item.type}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">No questions available.</p>
          )}
        </div>
      )}
      <Button
        onClick={onFinish} disabled={saveLoading}
        className="mt-4 justify-end flex items-center bg-blue-500 text-white hover:bg-blue-600">
          {saveLoading && <Loader2 className='animate-spin' />}
          Create Interview Link & Finish
        </Button>
    </div>
    
  );
 
  
}

export default QuestionList;
