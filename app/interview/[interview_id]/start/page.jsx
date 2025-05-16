"use client"
import { InterviewDataContext } from '@/context/InterViewDataContext';
import { Mic, Phone, Timer } from 'lucide-react';
import Image from 'next/image';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Vapi from "@vapi-ai/web";
import AlertConformation from './_componentes/AlertConformation';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/services/superbaseClient';

function Startinterview() {
  const { interviewInfo } = useContext(InterviewDataContext);
  const [callActive, setCallActive] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Initializing...");
  const [conversation, setConversation] = useState([]);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const { interview_id } = useParams();
  const router = useRouter();
 
  const [timer, setTimer] = useState(0);
  const vapiRef = useRef(null);
  const callAttempted = useRef(false);
  // Ref to store conversation data safely between renders
  const conversationRef = useRef([]);
  
  // Debug route information
  useEffect(() => {
    console.log("Start Interview Page Loaded");
    console.log("Current Interview ID:", interview_id);
    console.log("Current URL:", typeof window !== 'undefined' ? window.location.href : 'Server-side rendering');
    console.log("Interview Info in Context:", interviewInfo);
    
    // Validate that we have the necessary data to proceed
    if (!interviewInfo || !interviewInfo.interviewData) {
      console.error("Missing interview data in context");
      setError("Missing interview data. Please go back and try again.");
    }
  }, [interview_id, interviewInfo]);
  
  // Initialize Vapi once when component mounts
  useEffect(() => {
    console.log("Initializing Vapi component");
    try {
      if (!vapiRef.current && typeof window !== 'undefined') {
        console.log("API Key present:", !!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
        
        if (process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
          vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
          
          // Set up event listeners on the instance properly
          vapiRef.current.on("call-start", () => {
            console.log("Call has started.");
            setCallActive(true);
            // Reset conversation at the start of a new call
            conversationRef.current = [];
            setConversation([]);
          });
          
          vapiRef.current.on("call-end", () => {
            console.log("Call has ended.");
            setCallActive(false);
            setTimer(0);
            
            // Set conversation state from our ref for final update
            setConversation([...conversationRef.current]);
            
            // Wait a moment to ensure any final conversation updates are processed
            setTimeout(() => {
              if (conversationRef.current.length > 0) {
                console.log("Generating feedback with", conversationRef.current.length, "messages");
                GeneratedFeedback();
              } else {
                console.error("No conversation data available after call ended");
                setError("Interview ended but no conversation data was captured");
              }
            }, 1000);
          });
          
          // Handle different message types from Vapi
          vapiRef.current.on("message", (message) => {
            console.log("Message event received:", message);
            
            // If this is a conversation update with a full history
            if (message?.conversation && Array.isArray(message.conversation)) {
              console.log("Full conversation update received:", message.conversation.length, "messages");
              conversationRef.current = [...message.conversation];
              setConversation([...message.conversation]);
            }
            // If this is a transcript message (user's speech-to-text)
            else if (message?.type === 'transcript' && message?.transcript) {
              const userMessage = {
                role: "user", 
                content: message.transcript
              };
              console.log("User transcript received:", userMessage);
              // Only add if it's not already there (avoid duplicates)
              if (!conversationRef.current.some(msg => 
                msg.role === "user" && msg.content === message.transcript)) {
                conversationRef.current.push(userMessage);
                setConversation([...conversationRef.current]);
              }
            }
            // If this is the assistant's response
            else if (message?.type === 'model-output' && message?.output) {
              const assistantMessage = {
                role: "assistant",
                content: message.output
              };
              console.log("Assistant output received:", assistantMessage);
              // Only add if it's not already there (avoid duplicates)
              if (!conversationRef.current.some(msg => 
                msg.role === "assistant" && msg.content === message.output)) {
                conversationRef.current.push(assistantMessage);
                setConversation([...conversationRef.current]);
              }
            }
            // Any other message types we want to log but not process
            else {
              console.log("Other message type received:", message);
            }
          });
          
          console.log("Vapi instance created successfully");
          setStatus("Ready to start");
        } else {
          setError("Missing API key. Check your environment variables.");
          setStatus("Configuration error");
        }
      }
    } catch (error) {
      console.error("Error initializing Vapi:", error);
      setError(`Failed to initialize Vapi: ${error.message}`);
      setStatus("Initialization failed");
    }
  }, []);

  // Start call when interviewInfo is available
  useEffect(() => {
    if (interviewInfo && vapiRef.current && !callActive && !callAttempted.current) {
      console.log("Interview info available, attempting to start call");
      callAttempted.current = true;
      startCall();
    }
  }, [interviewInfo, callActive]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (callActive) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callActive]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Manual trigger for starting the call
  const manualStartCall = () => {
    if (callActive) {
      console.log("Call already active, ignoring start request");
      return;
    }
    
    console.log("Manual call start requested");
    callAttempted.current = true;
    startCall();
  };

  const startCall = async () => {
    if (!interviewInfo) {
      const msg = "Missing interview information";
      console.error(msg);
      setError(msg);
      setStatus("Missing interview data");
      return;
    }
    
    if (!vapiRef.current) {
      const msg = "Vapi service not initialized";
      console.error(msg);
      setError(msg);
      setStatus("Service not ready");
      return;
    }

    setStatus("Starting interview...");
    console.log("Starting call with interview info:", 
                JSON.stringify({
                  userName: interviewInfo.userName,
                  jobPosition: interviewInfo?.interviewData?.jobPosition
                }));

    try {
      // Make sure we have questions
      if (!interviewInfo.interviewData?.questionList || 
          !Array.isArray(interviewInfo.interviewData.questionList) ||
          interviewInfo.interviewData.questionList.length === 0) {
        throw new Error("No valid questions found for the interview");
      }

      // Combine all questions into one string
      const questionList = interviewInfo.interviewData.questionList
        .map((item) => item.question)
        .join(", ");

      console.log("Question list prepared:", questionList.substring(0, 100) + "...");

      // Detailed options for the assistant
      const assistantOptions = {
        name: "AI Recruiter",
        firstMessage: `Hi ${interviewInfo.userName}, I'm your AI interviewer for the ${interviewInfo.interviewData.jobPosition} position. Are you ready to begin?`,
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en-US",
        },
        voice: {
          provider: "playht",
          voiceId: "jennifer",
        },
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `
You are an AI voice assistant conducting interviews.
Your job is to ask candidates provided interview questions, assess their responses.
Begin the conversation with a friendly introduction, setting a relaxed yet professional tone. Example:
"Hey there! Welcome to your ${interviewInfo.interviewData.jobPosition} interview. Let's get started with a few questions!"
Ask one question at a time and wait for the candidate's response before proceeding. Keep the questions clear and concise. Below Are the questions ask one by one:
Questions: ${questionList}
If the candidate struggles, offer hints or rephrase the question without giving away the answer. Example:
"Need a hint? Think about how React tracks component updates!"
Provide brief, encouraging feedback after each answer. Example:
"Nice! That's a solid answer."
"Hmm, not quite! Want to try again?"
Keep the conversation natural and engaging—use casual phrases like "Alright, next up..." or "Let's tackle a tricky one!"
After 5–7 questions, wrap up the interview smoothly by summarizing their performance. Example:
"That was great! You handled some tough questions well. Keep sharpening your skills!"
End on a positive note:
"Thanks for chatting! Hope to see you crushing projects soon!"
Key Guidelines:
✅ Be friendly, engaging, and witty 💡
✅ Keep responses short and natural, like a real conversation
✅ Adapt based on the candidate's confidence level
✅ Ensure the interview remains focused on React
              `.trim(),
            },
          ],
        },
      };

      console.log("Calling Vapi.start with options");
      
      try {
        // Set a timeout for the API call
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const callObj = await vapiRef.current.start(assistantOptions);
        clearTimeout(timeoutId);
        
        if (!callObj) {
          throw new Error("Vapi.start returned no call object or id");
        }
        
        console.log("Call initiated successfully:", callObj);
        setCallActive(true);
        setError(null);
        setStatus("Interview in progress");
        
        // Add initial message to conversation (system message)
        const initialMessage = {
          role: "system",
          content: `Interview started for ${interviewInfo.userName} for ${interviewInfo.interviewData.jobPosition} position.`
        };
        conversationRef.current = [initialMessage];
        setConversation([initialMessage]);
        
      } catch (err) {
        if (err.name === 'AbortError') {
          throw new Error("Vapi.start timed out after 10 seconds");
        }
        throw err;
      }
      
    } catch (error) {
      console.error("Error starting interview:", error);
      setError(`Failed to start interview: ${error.message}`);
      setStatus("Failed to start");
      setCallActive(false);
      
      // Reset the call attempted flag to allow retrying
      callAttempted.current = false;
    }
  };

  const stopInterview = () => {
    if (vapiRef.current && callActive) {
      try {
        console.log("Stopping interview");
        vapiRef.current.stop();
        console.log("Interview stopped successfully");
        setCallActive(false);
        setTimer(0);
        setStatus("Interview stopped");
        
        // Save final conversation state
        setConversation([...conversationRef.current]);
        
        // Allow restarting
        callAttempted.current = false;
      } catch (error) {
        console.error("Error stopping interview:", error);
        setError(`Failed to stop interview: ${error.message}`);
      }
    } else {
      console.warn("No active vapi instance to stop");
    }
  };

  const GeneratedFeedback = async () => {
    setIsGeneratingFeedback(true);
    setStatus("Generating feedback...");
    
    try {
      // Use the conversation ref for the most up-to-date conversation data
      const currentConversation = conversationRef.current;
      
      // Check if we have conversation data before making the API call
      if (!currentConversation || currentConversation.length === 0) {
        console.error("No conversation data available for feedback generation");
        setError("No conversation data available");
        setIsGeneratingFeedback(false);
        setStatus("Feedback generation failed: No conversation data");
        return;
      }

      // Log the conversation data we're about to send
      console.log("Sending conversation data for analysis. Length:", currentConversation.length);
      if (currentConversation.length > 0) {
        console.log("First message:", JSON.stringify(currentConversation[0]).substring(0, 100) + "...");
        console.log("Last message:", JSON.stringify(currentConversation[currentConversation.length - 1]).substring(0, 100) + "...");
      }
      
      const result = await axios.post('/api/ai-feedback', {
        conversation: currentConversation
      });
      
      console.log("API response received:", result?.data);
      
      let feedbackData;
      
      if (result?.data?.success && result?.data?.feedback) {
        // If API returns the parsed JSON directly
        feedbackData = result.data.feedback;
        console.log("Feedback data received directly:", feedbackData);
      } else if (result?.data?.rawContent) {
        // If API returns raw content that needs parsing
        try {
          const contentStr = result.data.rawContent.replace('```json', '')
            .replace('```', '');
          feedbackData = JSON.parse(contentStr);
          console.log("Parsed feedback from raw content:", feedbackData);
        } catch (parseErr) {
          throw new Error(`Failed to parse raw content: ${parseErr.message}`);
        }
      } else if (result?.data?.content) {
        // Legacy format - using content field directly
        const FINAL_CONTENT = result.data.content.replace('```json', '')
          .replace('```', '');
        try {
          feedbackData = JSON.parse(FINAL_CONTENT);
          console.log("Parsed feedback from content field:", feedbackData);
        } catch (parseErr) {
          throw new Error(`Failed to parse content: ${parseErr.message}`);
        }
      } else {
        throw new Error("Unexpected API response format");
      }
      
      if (!feedbackData) {
        throw new Error("No valid feedback data obtained from API response");
      }
      
      // Save to Database
      const { data, error } = await supabase
        .from('interview-feedback')
        .insert([
          { 
            userName: interviewInfo?.userName,
            userEmail: interviewInfo?.userEmail,
            interview_id: interview_id,
            feedback: feedbackData,
            recommended: false,
          },
        ])
        .select();
        
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      console.log("Feedback saved to database:", data);
      router.replace('/interview/'+interview_id+"/completed");
    } catch (err) {
      console.error("Error in GeneratedFeedback:", err);
      setError(`Failed to generate feedback: ${err.message}`);
      setStatus("Feedback generation failed");
    } finally {
      setIsGeneratingFeedback(false);
    }
  };
  
  // Debug function to manually check conversation data
  const debugConversation = () => {
    console.log("Current conversation state:", conversation);
    console.log("Conversation ref data:", conversationRef.current);
    
    if (conversationRef.current.length > 0) {
      console.log("First message:", conversationRef.current[0]);
      console.log("Last message:", conversationRef.current[conversationRef.current.length - 1]);
    } else {
      console.log("Conversation ref is empty");
    }
  };
  
  // Manual trigger for feedback generation (for testing)
  const manualFeedbackGeneration = () => {
    if (conversationRef.current.length === 0) {
      // Create some test data if no real data exists
      conversationRef.current = [
        { role: "system", content: "Interview for test position" },
        { role: "assistant", content: "Hello, how are you today?" },
        { role: "user", content: "I'm good, thanks for asking." },
        { role: "assistant", content: "Great! Let's begin with a question..." }
      ];
    }
    GeneratedFeedback();
  };
  
  return (
    <div className='p-20 lg:px-48 xl:px-56'>
      <h2 className='font-bold text-xl justify-between flex'>AI Interview Session
        <span className='flex gap-2 items-center'>
          <Timer />
          {formatTime(timer)}
        </span>
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4 mb-4">
          <p>{error}</p>
          <button 
            onClick={() => {
              setError(null);
              callAttempted.current = false;
            }}
            className="mt-2 text-sm underline">
            Clear Error
          </button>
        </div>
      )}

      <div className='bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mt-4 mb-4'>
        <p>Status: {status}</p>
        <p className="text-xs mt-1">Messages: {conversationRef.current.length}</p>
      </div>

      {isGeneratingFeedback && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-4 mb-4 flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-yellow-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating interview feedback...
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-7 mt-5'>
        <div className='bg-white h-[400px] rounded-lg border flex flex-col gap-3 items-center justify-center'>
          <Image src={'/can.png'} alt='interviewer'
            width={100}
            height={100}
            className='w-[60px] h-[60px] rounded-full object-cover' />
          <h2>AI Recruiter</h2>
          {callActive ? (
            <span className="text-green-500 text-sm mt-2">Interview active</span>
          ) : (
            <span className="text-gray-500 text-sm mt-2">Interview not started</span>
          )}
        </div>

        <div className='bg-white h-[400px] rounded-lg border flex items-center justify-center flex-col gap-3'>
          <h2 className='text-2xl bg-blue-500 text-white p-3 rounded-full px-6'>
            {interviewInfo?.userName?.[0] || '?'}
          </h2>
          <h2>{interviewInfo?.userName || 'User'}</h2>
        </div>
      </div>

      <div className='flex items-center gap-5 justify-center mt-7'>
        {!callActive && (
          <button 
            onClick={manualStartCall}
            className="bg-green-500 text-white p-3 rounded-full cursor-pointer">
            Start Interview
          </button>
        )}
        <Mic className={`h-10 w-10 p-3 ${callActive ? 'bg-blue-500' : 'bg-gray-300'} text-white rounded-full cursor-pointer`} />
        <AlertConformation stopInterview={stopInterview}>
          <Phone className='h-10 w-10 p-3 bg-red-500 text-white rounded-full cursor-pointer' />
        </AlertConformation>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 flex justify-center gap-3">
          <button 
            onClick={debugConversation}
            className="bg-gray-200 text-gray-700 p-2 rounded text-sm">
            Debug Conversation
          </button>
          <button 
            onClick={manualFeedbackGeneration}
            className="bg-blue-200 text-blue-700 p-2 rounded text-sm">
            Manual Feedback Gen
          </button>
        </div>
      )}

      <h2 className='text-sm text-gray-400 mt-5 text-center'>
        {status}
      </h2>
    </div>
  );
}

export default Startinterview;