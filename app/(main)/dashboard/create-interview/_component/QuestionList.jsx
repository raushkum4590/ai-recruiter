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

  useEffect(() => {
    if (formData) generateQuestionList();
    else setLoading(false);
  }, [formData]);
  const generateQuestionList = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/ai-model', { ...formData });
      let raw = res.data.questions || res.data.question;
      let parsed = [];
  
      if (typeof raw === 'string') {
        const match = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        const jsonString = match ? match[1] : raw;
  
        try {
          parsed = JSON.parse(jsonString);
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          parsed = [];
        }
      } else if (Array.isArray(raw)) {
        parsed = raw;
      }
  
      setQuestionList(parsed);
    } catch (e) {
      console.error('Error fetching questions:', e);
      setQuestionList([]);
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

      // Insert into database
      const { data, error } = await supabase
        .from('Interviews')
        .insert([
          { 
            ...formData,
            questionList: questionList,
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
