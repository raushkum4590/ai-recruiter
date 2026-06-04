"use client"
import { InterviewDataContext } from '@/context/InterViewDataContext';
import {
  Mic, MicOff, Phone, Timer, Video, VideoOff,
  MessageSquare, Users, Monitor, MonitorOff,
  Hand, Smile, Send, X,
  Maximize2, Minimize2,
  Volume2, VolumeX, Loader2,
  Shield, Wifi, WifiOff,
  CheckCircle, AlertCircle, Settings,
} from 'lucide-react';
import Image from 'next/image';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Vapi from "@vapi-ai/web";
import AlertConformation from './_componentes/AlertConformation';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/services/superbaseClient';

const REACTIONS = ['👍', '👏', '❤️', '😮', '😂', '🎉'];

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
  const conversationRef = useRef([]);
  const feedbackTriggeredRef = useRef(false);

  // UI state
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'System', text: 'Interview session started. Good luck! 🎯', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isSystem: true },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [reaction, setReaction] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [networkQuality, setNetworkQuality] = useState('good');
  const [isSpeaking] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Lobby & device state
  const [phase, setPhase] = useState('lobby');
  const [devices, setDevices] = useState({ cameras: [], mics: [] });
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedMic, setSelectedMic] = useState('');
  const [captions, setCaptions] = useState({ text: '', speaker: '', isAI: false });
  const [micLevel, setMicLevel] = useState(0);
  const [lobbyReady, setLobbyReady] = useState(false);

  const videoRef = useRef(null);
  const lobbyVideoRef = useRef(null);
  const screenStreamRef = useRef(null);
  const chatEndRef = useRef(null);
  const containerRef = useRef(null);
  const reactionTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Enumerate devices once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then(() => navigator.mediaDevices.enumerateDevices())
      .then(list => {
        const cameras = list.filter(d => d.kind === 'videoinput');
        const mics = list.filter(d => d.kind === 'audioinput');
        setDevices({ cameras, mics });
        if (cameras.length) setSelectedCamera(cameras[0].deviceId);
        if (mics.length) setSelectedMic(mics[0].deviceId);
        setLobbyReady(true);
      })
      .catch(() => setLobbyReady(true));
  }, []);

  // Real mic level via Web Audio API AnalyserNode
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    let stream;

    navigator.mediaDevices?.getUserMedia({
      audio: { deviceId: selectedMic ? { exact: selectedMic } : undefined },
    }).then(s => {
      if (cancelled) { s.getTracks().forEach(t => t.stop()); return; }
      stream = s;
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(s);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 128;
      source.connect(analyserRef.current);

      let lastUpdate = 0;
      const tick = (timestamp) => {
        if (cancelled || !analyserRef.current) return;
        animFrameRef.current = requestAnimationFrame(tick);
        if (timestamp - lastUpdate < 100) return;
        lastUpdate = timestamp;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const level = Math.round(data.reduce((a, b) => a + b, 0) / data.length);
        setMicLevel(prev => Math.abs(prev - level) > 2 ? level : prev);
      };
      animFrameRef.current = requestAnimationFrame(tick);
    }).catch(() => {});

    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameRef.current);
      stream?.getTracks().forEach(t => t.stop());
      if (audioContextRef.current?.state !== 'closed') audioContextRef.current?.close();
    };
  }, [selectedMic]);

  // Lobby camera preview
  useEffect(() => {
    if (phase !== 'lobby' || typeof window === 'undefined') return;
    let cancelled = false;
    let stream;

    navigator.mediaDevices?.getUserMedia({
      video: { deviceId: selectedCamera ? { exact: selectedCamera } : undefined },
      audio: false,
    }).then(s => {
      if (cancelled) { s.getTracks().forEach(t => t.stop()); return; }
      stream = s;
      if (lobbyVideoRef.current) lobbyVideoRef.current.srcObject = s;
    }).catch(() => {});

    return () => {
      cancelled = true;
      stream?.getTracks().forEach(t => t.stop());
      if (lobbyVideoRef.current) lobbyVideoRef.current.srcObject = null;
    };
  }, [phase, selectedCamera]);

  // Interview camera feed
  useEffect(() => {
    if (phase !== 'interview' || typeof window === 'undefined') return;
    if (camEnabled) {
      navigator.mediaDevices?.getUserMedia({
        video: { deviceId: selectedCamera ? { exact: selectedCamera } : undefined },
        audio: false,
      }).then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }).catch(() => setCamEnabled(false));
    } else {
      videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    return () => {
      videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    };
  }, [camEnabled, phase, selectedCamera]);

  // Chat scroll + unread
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (activePanel !== 'chat' && chatMessages.length > 1) setUnreadCount(c => c + 1);
  }, [chatMessages]);
  useEffect(() => { if (activePanel === 'chat') setUnreadCount(0); }, [activePanel]);

  // Network quality simulation
  useEffect(() => {
    const id = setInterval(() => {
      const r = Math.random();
      setNetworkQuality(r > 0.9 ? 'poor' : r > 0.75 ? 'fair' : 'good');
    }, 10000);
    return () => clearInterval(id);
  }, []);

  // Captions auto-clear after 6s
  useEffect(() => {
    if (!captions.text) return;
    const t = setTimeout(() => setCaptions({ text: '', speaker: '', isAI: false }), 6000);
    return () => clearTimeout(t);
  }, [captions.text]);

  // Vapi init
  useEffect(() => {
    if (vapiRef.current || typeof window === 'undefined') return;
    if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
      setError("Missing Vapi API key.");
      return;
    }
    try {
      vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);

      vapiRef.current.on("error", e => {
        setError(`Call error: ${e?.message || e?.errorMsg || JSON.stringify(e)}`);
        setCallActive(false);
        setAiSpeaking(false);
      });
      vapiRef.current.on("call-start", () => {
        setCallActive(true);
        setAiSpeaking(true);
        conversationRef.current = [];
        setConversation([]);
        addChatMessage('System', '🟢 AI Interviewer has joined the session.', true);
      });
      vapiRef.current.on("call-end", () => {
        setCallActive(false);
        setTimer(0);
        setAiSpeaking(false);
        feedbackTriggeredRef.current = false;
        addChatMessage('System', '🔴 Session ended. Generating feedback...', true);
        setTimeout(() => {
          if (!feedbackTriggeredRef.current) {
            if (conversationRef.current.length > 0) { feedbackTriggeredRef.current = true; GeneratedFeedback(); }
            else setError("No conversation captured. Please try again.");
          }
        }, 4000);
      });
      vapiRef.current.on("speech-start", () => setAiSpeaking(true));
      vapiRef.current.on("speech-end", () => setAiSpeaking(false));

      vapiRef.current.on("message", message => {
        if (message?.type === 'end-of-call-report') {
          const msgs = message.messages || message.conversation || [];
          if (msgs.length) { conversationRef.current = msgs; setConversation([...msgs]); }
          if (!feedbackTriggeredRef.current) { feedbackTriggeredRef.current = true; GeneratedFeedback(); }
          return;
        }
        const msgs = message?.messages || message?.conversation;
        if (Array.isArray(msgs) && msgs.length) { conversationRef.current = [...msgs]; setConversation([...msgs]); return; }

        if (message?.type === 'transcript' && message?.transcript) {
          const isAI = message.role === 'assistant';
          const speaker = isAI ? 'AI Recruiter' : (interviewInfo?.userName || 'You');
          setCaptions({ text: message.transcript, speaker, isAI });
          if (message.transcriptType === 'final') {
            const entry = { role: message.role || 'user', content: message.transcript };
            if (!conversationRef.current.some(m => m.role === entry.role && m.content === entry.content)) {
              conversationRef.current.push(entry);
              setConversation([...conversationRef.current]);
              if (isAI) addChatMessage('AI Recruiter', message.transcript, false, true);
            }
          }
        }
      });

      setStatus("Ready to start");
    } catch (err) {
      setError(`Failed to initialize: ${err.message}`);
    }
  }, []);

  // Only show "missing interview data" error if interviewInfo is truly absent after a brief wait
  useEffect(() => {
    if (!interviewInfo?.interviewData) {
      const timer = setTimeout(() => {
        if (!interviewInfo?.interviewData) {
          setError("Missing interview data. Please go back and join again.");
        }
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      // Clear the error if data arrives
      setError(prev => prev === "Missing interview data. Please go back and join again." ? null : prev);
    }
  }, [interviewInfo]);

  // Auto-start call when entering interview phase
  useEffect(() => {
    if (phase === 'interview' && interviewInfo && vapiRef.current && !callActive && !callAttempted.current) {
      callAttempted.current = true;
      startCall();
    }
  }, [interviewInfo, callActive, phase]);

  useEffect(() => {
    let id;
    if (callActive) id = setInterval(() => setTimer(p => p + 1), 1000);
    return () => clearInterval(id);
  }, [callActive]);

  const formatTime = s => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const addChatMessage = (sender, text, isSystem = false, isAI = false) =>
    setChatMessages(prev => [...prev, {
      id: Date.now(), sender, text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem, isAI,
    }]);

  const sendChat = () => {
    if (!chatInput.trim()) return;
    addChatMessage(interviewInfo?.userName || 'You', chatInput.trim());
    setChatInput('');
  };

  const handleReaction = emoji => {
    setReaction(emoji);
    setShowReactionPicker(false);
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
    reactionTimerRef.current = setTimeout(() => setReaction(null), 3000);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
      setIsScreenSharing(false);
      addChatMessage('System', `📺 Screen sharing stopped.`, true);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        stream.getVideoTracks()[0].onended = () => { setIsScreenSharing(false); screenStreamRef.current = null; };
        setIsScreenSharing(true);
        addChatMessage('System', `📺 Screen sharing started.`, true);
      } catch (e) {
        if (e.name !== 'NotAllowedError') addChatMessage('System', '❌ Could not share screen.', true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { containerRef.current?.requestFullscreen(); setIsFullscreen(true); }
    else { document.exitFullscreen(); setIsFullscreen(false); }
  };

  const toggleMic = () => {
    const willBeMuted = micEnabled;
    setMicEnabled(m => !m);
    if (vapiRef.current && callActive) {
      try { vapiRef.current.setMuted(willBeMuted); } catch (_) {}
    }
  };

  const toggleSpeaker = () => {
    setSpeakerEnabled(s => {
      const next = !s;
      document.querySelectorAll('audio').forEach(el => { el.volume = next ? 1 : 0; });
      return next;
    });
  };

  const startCall = async () => {
    if (!interviewInfo || !vapiRef.current) return;
    setStatus("Starting interview...");
    try {
      if (!interviewInfo.interviewData?.questionList?.length) throw new Error("No questions found");
      const questionList = interviewInfo.interviewData.questionList
        .map(i => (typeof i === 'string' ? i : i.question)).join(", ");

      await vapiRef.current.start({
        name: "AI Recruiter",
        firstMessage: `Hi ${interviewInfo.userName}, I'm your AI interviewer for the ${interviewInfo.interviewData.jobPosition} position. Are you ready to begin?`,
        transcriber: { provider: "deepgram", model: "nova-2", language: "en-US" },
        voice: { provider: "openai", voiceId: "alloy" },
        model: {
          provider: "openai",
          model: "gpt-3.5-turbo",
          messages: [{ role: "system", content: `You are an AI voice assistant conducting interviews. Ask candidates the provided questions one at a time, wait for responses, and give brief encouraging feedback. Questions: ${questionList}. After all questions, wrap up positively.` }],
        },
      });
      setCallActive(true);
      setError(null);
      setStatus("Interview in progress");
      conversationRef.current = [{ role: "system", content: `Interview started for ${interviewInfo.userName}` }];
      setConversation([...conversationRef.current]);
    } catch (err) {
      setError(`Failed to start: ${err.message}`);
      setStatus("Failed to start");
      setCallActive(false);
      callAttempted.current = false;
    }
  };

  const stopInterview = () => {
    if (vapiRef.current && callActive) {
      vapiRef.current.stop();
      setCallActive(false);
      setTimer(0);
      setStatus("Interview stopped");
      setConversation([...conversationRef.current]);
      callAttempted.current = false;
    }
  };

  const GeneratedFeedback = async () => {
    setIsGeneratingFeedback(true);
    setStatus("Generating feedback...");
    try {
      const currentConversation = conversationRef.current;
      if (!currentConversation?.length) throw new Error("No conversation data");

      const result = await axios.post('/api/ai-feedback', { conversation: currentConversation });
      let feedbackData;
      if (result?.data?.success && result?.data?.feedback) feedbackData = result.data.feedback;
      else if (result?.data?.rawContent) feedbackData = JSON.parse(result.data.rawContent.replace('```json','').replace('```',''));
      else if (result?.data?.content) feedbackData = JSON.parse(result.data.content.replace('```json','').replace('```',''));
      else throw new Error("Unexpected API response");

      const { error: dbError } = await supabase.from('interview-feedback').insert([{
        userName: interviewInfo?.userName,
        userEmail: interviewInfo?.userEmail,
        interview_id,
        feedback: feedbackData,
        recommended: false,
      }]);
      if (dbError) throw new Error(`DB error: ${dbError.message}`);
      router.replace(`/interview/${interview_id}/completed`);
    } catch (err) {
      setError(`Failed to generate feedback: ${err.message}`);
      setStatus("Feedback generation failed");
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const networkColor = { good: '#22c55e', fair: '#f59e0b', poor: '#ef4444' }[networkQuality];
  const NetworkIcon = networkQuality === 'poor' ? WifiOff : Wifi;
  const participants = [
    { name: 'AI Recruiter', role: 'Interviewer', avatar: '/can.png', isAI: true, speaking: aiSpeaking },
    { name: interviewInfo?.userName || 'You', role: 'Candidate', avatar: null, isAI: false, speaking: isSpeaking },
  ];

  const activeBars = Math.round((micLevel / 255) * 5);

  // ─── LOBBY ────────────────────────────────────────────────────────────────
  if (phase === 'lobby') {
    return (
      <div style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', sans-serif", color: '#fff', padding: 20,
        overflow: 'hidden',
      }}>
        {/* Animated background orbs */}
        <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{
          width: '100%', maxWidth: 920,
          display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 0,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24, overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        }}>
          {/* Camera preview - left column */}
          <div style={{ position: 'relative', background: '#060417', minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <video ref={lobbyVideoRef} autoPlay muted playsInline
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
            {/* Gradient overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,4,23,0.9) 0%, rgba(6,4,23,0.2) 40%, transparent 70%)' }} />

            {!camEnabled && (
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <div style={{
                  width: 88, height: 88, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 36, fontWeight: 700, margin: '0 auto 12px',
                  border: '3px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                }}>
                  {(interviewInfo?.userName?.[0] || 'U').toUpperCase()}
                </div>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>Camera is off</span>
              </div>
            )}

            {/* Mic level indicator */}
            <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4, alignItems: 'flex-end', background: 'rgba(0,0,0,0.5)', padding: '8px 12px', borderRadius: 20, backdropFilter: 'blur(8px)' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{
                  width: 5, height: 8 + i * 6,
                  background: i < activeBars ? '#22c55e' : 'rgba(255,255,255,0.15)',
                  borderRadius: 3, transition: 'background 0.08s',
                }} />
              ))}
            </div>

            <div style={{ position: 'absolute', bottom: 16, left: 14, background: 'rgba(0,0,0,0.65)', borderRadius: 8, padding: '4px 12px', fontSize: 12, backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: camEnabled ? '#22c55e' : '#ef4444' }} />
              {interviewInfo?.userName || 'You'}
            </div>

            {/* "You" label top */}
            <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: '#94a3b8', backdropFilter: 'blur(8px)' }}>
              Preview
            </div>
          </div>

          {/* Settings pane - right column */}
          <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)' }}>
            <div>
              {/* Header badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 800, letterSpacing: 1.5 }}>
                  AI INTERVIEW
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', animation: 'pulse 2s infinite' }} />
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px', lineHeight: 1.2 }}>
                {interviewInfo?.interviewData?.jobPosition || 'Interview Session'}
              </h2>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 28px' }}>
                Check your camera and microphone before joining
              </p>

              {/* Camera row */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: 1.2, marginBottom: 8 }}>CAMERA</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setCamEnabled(c => !c)} style={lobbyToggleStyle(camEnabled)}>
                    {camEnabled ? <><Video size={13} /> On</> : <><VideoOff size={13} /> Off</>}
                  </button>
                  {devices.cameras.length > 0 && (
                    <select value={selectedCamera} onChange={e => setSelectedCamera(e.target.value)} style={selectStyle}>
                      {devices.cameras.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Camera'}</option>)}
                    </select>
                  )}
                </div>
              </div>

              {/* Mic row + level bar */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: 1.2, marginBottom: 8 }}>MICROPHONE</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setMicEnabled(m => !m)} style={lobbyToggleStyle(micEnabled)}>
                    {micEnabled ? <><Mic size={13} /> On</> : <><MicOff size={13} /> Off</>}
                  </button>
                  {devices.mics.length > 0 && (
                    <select value={selectedMic} onChange={e => setSelectedMic(e.target.value)} style={selectStyle}>
                      {devices.mics.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microphone'}</option>)}
                    </select>
                  )}
                </div>
                {/* 20-segment level bar */}
                <div style={{ display: 'flex', gap: 2, marginTop: 10, height: 16 }}>
                  {Array.from({ length: 20 }).map((_, i) => {
                    const active = i < Math.round((micLevel / 255) * 20);
                    return (
                      <div key={i} style={{
                        flex: 1, borderRadius: 2,
                        background: active ? (i > 14 ? '#ef4444' : i > 8 ? '#f59e0b' : '#22c55e') : 'rgba(255,255,255,0.08)',
                        transition: 'background 0.05s',
                      }} />
                    );
                  })}
                </div>
              </div>

              {/* Readiness checklist */}
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 16px', marginBottom: 28, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: 1.2, marginBottom: 10 }}>READINESS CHECK</div>
                {[
                  { label: 'Stable internet', ok: networkQuality !== 'poor' },
                  { label: 'Camera working', ok: camEnabled },
                  { label: 'Microphone active', ok: micEnabled && micLevel > 3 },
                  { label: 'Interview data loaded', ok: !!interviewInfo?.interviewData },
                ].map(({ label, ok }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, fontSize: 12 }}>
                    {ok ? <CheckCircle size={13} color="#22c55e" /> : <AlertCircle size={13} color="#f59e0b" />}
                    <span style={{ color: ok ? '#e2e8f0' : '#94a3b8' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Join button */}
            <button
              onClick={() => setPhase('interview')}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none', color: '#fff', borderRadius: 14, padding: '14px',
                fontWeight: 700, cursor: 'pointer', fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 8px 32px rgba(99,102,241,0.5)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                letterSpacing: 0.3,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.65)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.5)'; }}
            >
              <Video size={18} /> Join Interview Room
            </button>
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
          select option { background: #1e1b4b; color: #e2e8f0; }
        `}</style>
      </div>
    );
  }

  // ─── INTERVIEW (Zoom-like room) ─────────────────────────────────────────────
  return (
    <div ref={containerRef} style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #0a0818 0%, #1a1535 50%, #0d0c1e 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', sans-serif", color: '#fff',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Animated background */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      {/* ── Top Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        zIndex: 10, position: 'relative',
      }}>
        {/* Left: branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 8, padding: '4px 12px', fontSize: 11,
            fontWeight: 800, letterSpacing: 1.5,
          }}>AI INTERVIEW</div>
          <span style={{ fontSize: 13, color: '#a5b4fc', fontWeight: 500 }}>
            {interviewInfo?.interviewData?.jobPosition || 'Interview Session'}
          </span>
          {callActive && (
            <span style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.5)',
              color: '#fca5a5', borderRadius: 20, padding: '2px 10px',
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{ width: 6, height: 6, background: '#ef4444', borderRadius: '50%', display: 'inline-block', animation: 'livePulse 1.2s infinite' }} />
              LIVE
            </span>
          )}
        </div>

        {/* Center: timer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 20, padding: '6px 18px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <Timer size={14} color="#a5b4fc" />
          <span style={{ fontFamily: 'monospace', fontSize: 17, fontWeight: 700, color: '#e2e8f0', letterSpacing: 2 }}>
            {formatTime(timer)}
          </span>
        </div>

        {/* Right: network + fullscreen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <NetworkIcon size={14} style={{ color: networkColor }} />
            <span style={{ fontSize: 11, color: networkColor, textTransform: 'capitalize', fontWeight: 600 }}>{networkQuality}</span>
          </div>
          <button
            onClick={toggleFullscreen}
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8, padding: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{
          margin: '8px 16px 0',
          background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.35)',
          color: '#fca5a5', borderRadius: 10, padding: '10px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13,
          zIndex: 10, position: 'relative',
        }}>
          <span>⚠️ {error}</span>
          <button onClick={() => { setError(null); callAttempted.current = false; }} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}

      {/* ── Feedback generating banner ── */}
      {isGeneratingFeedback && (
        <div style={{
          margin: '8px 16px 0',
          background: 'rgba(245,158,11,0.12)',
          border: '1px solid rgba(245,158,11,0.35)',
          color: '#fde68a', borderRadius: 10, padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 13,
          zIndex: 10, position: 'relative',
        }}>
          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
          Generating your interview feedback... Please wait.
        </div>
      )}

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* Video grid area */}
        <div style={{ flex: 1, padding: '14px 14px 0', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden', minWidth: 0 }}>

          {/* Two video tiles */}
          <div style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: activePanel ? '1fr 1fr' : '1fr 1fr',
            gap: 12,
            minHeight: 0,
          }}>

            {/* ── AI Recruiter Tile ── */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: aiSpeaking ? '2px solid #6366f1' : '2px solid rgba(255,255,255,0.07)',
              borderRadius: 20,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
              transition: 'border-color 0.4s, box-shadow 0.4s',
              boxShadow: aiSpeaking ? '0 0 30px rgba(99,102,241,0.25), inset 0 0 30px rgba(99,102,241,0.05)' : 'inset 0 0 60px rgba(0,0,0,0.3)',
            }}>
              {/* Speaking pulse background */}
              {aiSpeaking && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'radial-gradient(circle at center, rgba(99,102,241,0.12) 0%, transparent 70%)',
                  animation: 'breathe 2s ease-in-out infinite',
                }} />
              )}

              {/* AI avatar */}
              <div style={{ position: 'relative', marginBottom: 16, zIndex: 1 }}>
                <div style={{
                  width: 96, height: 96, borderRadius: '50%', overflow: 'hidden',
                  border: `3px solid ${aiSpeaking ? '#6366f1' : 'rgba(255,255,255,0.15)'}`,
                  transition: 'border-color 0.3s',
                  boxShadow: aiSpeaking ? '0 0 20px rgba(99,102,241,0.5)' : '0 4px 20px rgba(0,0,0,0.3)',
                }}>
                  <Image src="/can.png" alt="AI Recruiter" width={96} height={96} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                {aiSpeaking && (
                  <div style={{
                    position: 'absolute', bottom: -2, right: -2,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    borderRadius: '50%', width: 26, height: 26,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #0a0818',
                    animation: 'bounce 0.8s ease-in-out infinite',
                  }}>
                    <Volume2 size={12} color="#fff" />
                  </div>
                )}
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px', zIndex: 1 }}>AI Recruiter</h3>
              <span style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14, zIndex: 1 }}>
                {callActive ? (aiSpeaking ? '🎙️ Speaking...' : '👂 Listening...') : '⏳ Waiting to connect...'}
              </span>

              {/* Sound bars when speaking */}
              {aiSpeaking && (
                <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 28, zIndex: 1 }}>
                  {[14, 22, 10, 20, 16, 24, 12].map((h, i) => (
                    <div key={i} style={{
                      width: 4, background: 'linear-gradient(to top, #6366f1, #a5b4fc)',
                      borderRadius: 3,
                      animation: `soundbar${i % 3} ${0.6 + i * 0.1}s ease-in-out infinite`,
                      animationDelay: `${i * 0.12}s`,
                      height: `${h}px`,
                    }} />
                  ))}
                </div>
              )}

              {/* Bottom labels */}
              <div style={{
                position: 'absolute', bottom: 14, left: 14,
                background: 'rgba(0,0,0,0.65)', borderRadius: 8, padding: '4px 10px',
                fontSize: 11, display: 'flex', alignItems: 'center', gap: 6,
                backdropFilter: 'blur(8px)',
              }}>
                🤖 AI Interviewer
              </div>
              <div style={{ position: 'absolute', bottom: 14, right: 14 }}>
                <Volume2 size={15} color={aiSpeaking ? '#a5b4fc' : '#475569'} />
              </div>

              {/* AI Captions */}
              {captions.text && captions.isAI && (
                <div style={{
                  position: 'absolute', bottom: 48, left: 10, right: 10,
                  background: 'rgba(0,0,0,0.85)', borderRadius: 10,
                  padding: '8px 12px', fontSize: 12, lineHeight: 1.5, color: '#e2e8f0',
                  border: '1px solid rgba(99,102,241,0.4)', maxHeight: 72, overflow: 'hidden',
                  backdropFilter: 'blur(8px)',
                }}>
                  <span style={{ color: '#a5b4fc', fontWeight: 700, fontSize: 10, display: 'block', marginBottom: 3 }}>AI Recruiter</span>
                  {captions.text}
                </div>
              )}
            </div>

            {/* ── Candidate Tile ── */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '2px solid rgba(255,255,255,0.07)',
              borderRadius: 20,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
              boxShadow: 'inset 0 0 60px rgba(0,0,0,0.3)',
            }}>
              {/* Camera video */}
              {camEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay muted playsInline
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover', borderRadius: 18,
                    transform: 'scaleX(-1)',
                  }}
                />
              ) : (
                <div style={{
                  width: 96, height: 96, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 38, fontWeight: 700, marginBottom: 14,
                  border: '3px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                }}>
                  {(interviewInfo?.userName?.[0] || 'U').toUpperCase()}
                </div>
              )}

              {/* Gradient overlay over video */}
              {camEnabled && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(10,8,24,0.8) 0%, rgba(10,8,24,0.1) 30%, transparent 60%)',
                  borderRadius: 18, pointerEvents: 'none',
                }} />
              )}

              {/* Name when cam off */}
              {!camEnabled && (
                <>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px', zIndex: 1 }}>{interviewInfo?.userName || 'You'}</h3>
                  <span style={{ fontSize: 12, color: '#94a3b8', zIndex: 1 }}>Camera Off</span>
                </>
              )}

              {/* Screen share badge */}
              {isScreenSharing && (
                <div style={{
                  position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(99,102,241,0.9)', borderRadius: 20,
                  padding: '5px 14px', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6, zIndex: 5,
                  backdropFilter: 'blur(8px)',
                }}>
                  <Monitor size={11} /> Screen Sharing
                </div>
              )}

              {/* Reaction float */}
              {reaction && (
                <div style={{
                  position: 'absolute', top: '30%', left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 52, zIndex: 10, animation: 'floatUp 3s ease-out forwards',
                }}>
                  {reaction}
                </div>
              )}

              {/* Hand raised */}
              {handRaised && (
                <div style={{
                  position: 'absolute', top: 14, right: 14,
                  background: 'rgba(245,158,11,0.9)', borderRadius: '50%',
                  width: 30, height: 30,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'bounce 1s infinite', zIndex: 5,
                }}>
                  <Hand size={15} color="#fff" />
                </div>
              )}

              {/* Bottom name label */}
              <div style={{
                position: 'absolute', bottom: 14, left: 14, zIndex: 5,
                background: 'rgba(0,0,0,0.65)', borderRadius: 8, padding: '4px 10px',
                fontSize: 11, display: 'flex', alignItems: 'center', gap: 6,
                backdropFilter: 'blur(8px)',
              }}>
                {!micEnabled && <MicOff size={10} color="#ef4444" />}
                {interviewInfo?.userName || 'You'} (You)
              </div>

              {/* Mic level bars (bottom right) */}
              <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 5, display: 'flex', gap: 2, alignItems: 'flex-end', height: 20 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{
                    width: 3, height: 5 + i * 4,
                    background: (i < activeBars && micEnabled) ? '#22c55e' : 'rgba(255,255,255,0.15)',
                    borderRadius: 2, transition: 'background 0.08s',
                  }} />
                ))}
              </div>

              {!camEnabled && (
                <div style={{ position: 'absolute', bottom: 14, right: 14, zIndex: 5 }}>
                  <VideoOff size={15} color="#ef4444" />
                </div>
              )}

              {/* Candidate captions */}
              {captions.text && !captions.isAI && (
                <div style={{
                  position: 'absolute', bottom: 50, left: 10, right: 10, zIndex: 5,
                  background: 'rgba(0,0,0,0.85)', borderRadius: 10,
                  padding: '8px 12px', fontSize: 12, lineHeight: 1.5, color: '#e2e8f0',
                  border: '1px solid rgba(34,197,94,0.35)', maxHeight: 72, overflow: 'hidden',
                  backdropFilter: 'blur(8px)',
                }}>
                  <span style={{ color: '#34d399', fontWeight: 700, fontSize: 10, display: 'block', marginBottom: 3 }}>{captions.speaker}</span>
                  {captions.text}
                </div>
              )}
            </div>
          </div>

          {/* Status bar */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: '8px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 4,
          }}>
            <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={12} />{status}
            </span>
            <span style={{ fontSize: 12, color: '#475569' }}>{conversation.length} messages captured</span>
          </div>
        </div>

        {/* ── Side Panel ── */}
        {activePanel && (
          <div style={{
            width: 300, borderLeft: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)',
            display: 'flex', flexDirection: 'column',
            animation: 'slideIn 0.2s ease-out',
            flexShrink: 0,
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                {activePanel === 'chat' ? '💬 Chat' : '👥 Participants'}
              </span>
              <button onClick={() => setActivePanel(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={16} /></button>
            </div>

            {activePanel === 'chat' && (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {chatMessages.map(msg => (
                    <div key={msg.id} style={{
                      padding: msg.isSystem ? '6px 10px' : '8px 12px',
                      background: msg.isSystem ? 'rgba(99,102,241,0.08)' : msg.isAI ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${msg.isSystem ? 'rgba(99,102,241,0.2)' : msg.isAI ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: msg.isSystem ? 6 : 10, fontSize: msg.isSystem ? 11 : 12,
                    }}>
                      {!msg.isSystem && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 11, color: msg.isAI ? '#a5b4fc' : '#34d399' }}>{msg.sender}</span>
                          <span style={{ fontSize: 10, color: '#475569' }}>{msg.time}</span>
                        </div>
                      )}
                      <p style={{ margin: 0, color: msg.isSystem ? '#94a3b8' : '#e2e8f0', lineHeight: 1.4 }}>{msg.text}</p>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 8 }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder="Type a message..."
                    style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 12, outline: 'none' }}
                  />
                  <button onClick={sendChat} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}>
                    <Send size={14} />
                  </button>
                </div>
              </>
            )}

            {activePanel === 'participants' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                <p style={{ fontSize: 11, color: '#475569', margin: '0 0 12px', fontWeight: 700, letterSpacing: 1 }}>{participants.length} PARTICIPANTS</p>
                {participants.map((p, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${p.speaking ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 12, marginBottom: 8, transition: 'border-color 0.3s',
                  }}>
                    {p.avatar ? (
                      <Image src={p.avatar} alt={p.name} width={38} height={38} style={{ borderRadius: '50%', border: `2px solid ${p.speaking ? '#6366f1' : 'rgba(255,255,255,0.15)'}` }} />
                    ) : (
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 15,
                        border: `2px solid ${p.speaking ? '#6366f1' : 'rgba(255,255,255,0.15)'}`,
                      }}>
                        {p.name[0].toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#475569' }}>{p.role}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {p.speaking && <Volume2 size={12} color="#a5b4fc" />}
                      {!p.isAI && !micEnabled && <MicOff size={12} color="#ef4444" />}
                      {!p.isAI && !camEnabled && <VideoOff size={12} color="#ef4444" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom Controls ── */}
      <div style={{
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 10, position: 'relative',
      }}>
        {/* Left controls */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <ControlBtn icon={micEnabled ? <Mic size={18} /> : <MicOff size={18} />} label={micEnabled ? 'Mute' : 'Unmute'} active={micEnabled} danger={!micEnabled} onClick={toggleMic} />
          <ControlBtn icon={camEnabled ? <Video size={18} /> : <VideoOff size={18} />} label={camEnabled ? 'Stop Video' : 'Start Video'} active={camEnabled} danger={!camEnabled} onClick={() => setCamEnabled(c => !c)} />
          <ControlBtn icon={speakerEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />} label={speakerEnabled ? 'Mute Audio' : 'Unmute Audio'} active={speakerEnabled} onClick={toggleSpeaker} />
        </div>

        {/* Center controls */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <ControlBtn icon={isScreenSharing ? <MonitorOff size={18} /> : <Monitor size={18} />} label={isScreenSharing ? 'Stop Share' : 'Share Screen'} active={!isScreenSharing} highlight={isScreenSharing} onClick={toggleScreenShare} />
          <ControlBtn
            icon={<Hand size={18} />}
            label={handRaised ? 'Lower Hand' : 'Raise Hand'}
            active={!handRaised} highlight={handRaised}
            onClick={() => { setHandRaised(h => !h); addChatMessage('System', `✋ ${interviewInfo?.userName || 'You'} ${handRaised ? 'lowered' : 'raised'} their hand.`, true); }}
          />
          <div style={{ position: 'relative' }}>
            <ControlBtn icon={<Smile size={18} />} label="React" active={true} onClick={() => setShowReactionPicker(r => !r)} />
            {showReactionPicker && (
              <div style={{
                position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(10,8,24,0.97)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 14, padding: 10, display: 'flex', gap: 6,
                backdropFilter: 'blur(20px)', animation: 'fadeIn 0.15s ease-out',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}>
                {REACTIONS.map(r => (
                  <button key={r} onClick={() => handleReaction(r)}
                    style={{ background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', padding: '4px 6px', borderRadius: 8, transition: 'background 0.15s' }}
                    onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.target.style.background = 'none'}>
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <ControlBtn icon={<MessageSquare size={18} />} label="Chat" active={activePanel !== 'chat'} highlight={activePanel === 'chat'} onClick={() => setActivePanel(p => p === 'chat' ? null : 'chat')} />
            {unreadCount > 0 && activePanel !== 'chat' && (
              <div style={{ position: 'absolute', top: 2, right: 2, background: '#ef4444', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</div>
            )}
          </div>
          <ControlBtn icon={<Users size={18} />} label="Participants" active={activePanel !== 'participants'} highlight={activePanel === 'participants'} onClick={() => setActivePanel(p => p === 'participants' ? null : 'participants')} />
        </div>

        {/* Right: start/end */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {!callActive && (
            <button
              onClick={() => { callAttempted.current = false; startCall(); }}
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                border: 'none', color: '#fff', borderRadius: 12,
                padding: '10px 22px', fontWeight: 700, cursor: 'pointer',
                fontSize: 13, display: 'flex', alignItems: 'center', gap: 7,
                boxShadow: '0 4px 20px rgba(34,197,94,0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(34,197,94,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(34,197,94,0.4)'; }}
            >
              <Video size={16} /> Start Interview
            </button>
          )}
          <AlertConformation stopInterview={stopInterview}>
            <button
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none', color: '#fff', borderRadius: 12,
                padding: '10px 22px', fontWeight: 700, cursor: 'pointer',
                fontSize: 13, display: 'flex', alignItems: 'center', gap: 7,
                boxShadow: '0 4px 20px rgba(239,68,68,0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(239,68,68,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(239,68,68,0.4)'; }}
            >
              <Phone size={16} /> End Interview
            </button>
          </AlertConformation>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes breathe { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slideIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatUp { 0%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} 100%{opacity:0;transform:translateX(-50%) translateY(-90px) scale(1.6)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes soundbar0 { 0%,100%{height:8px} 50%{height:22px} }
        @keyframes soundbar1 { 0%,100%{height:18px} 50%{height:6px} }
        @keyframes soundbar2 { 0%,100%{height:12px} 50%{height:26px} }
        input::placeholder { color: #475569; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }
      `}</style>
    </div>
  );
}

// Lobby style helpers
const lobbyToggleStyle = active => ({
  background: active ? 'rgba(99,102,241,0.18)' : 'rgba(239,68,68,0.12)',
  border: `1px solid ${active ? 'rgba(99,102,241,0.45)' : 'rgba(239,68,68,0.35)'}`,
  color: active ? '#a5b4fc' : '#fca5a5',
  borderRadius: 8, padding: '7px 13px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, whiteSpace: 'nowrap',
  transition: 'all 0.2s',
});

const selectStyle = {
  flex: 1,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#e2e8f0', borderRadius: 8, padding: '7px 10px',
  fontSize: 11, outline: 'none',
};

function ControlBtn({ icon, label, danger, highlight, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={label}
        style={{
          width: 46, height: 46,
          background: danger ? 'rgba(239,68,68,0.15)' : highlight ? 'rgba(99,102,241,0.25)' : hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
          border: danger ? '1px solid rgba(239,68,68,0.4)' : highlight ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, color: danger ? '#fca5a5' : highlight ? '#a5b4fc' : '#e2e8f0',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
          transform: hovered ? 'scale(1.1) translateY(-2px)' : 'scale(1)',
          boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        {icon}
      </button>
      <span style={{ fontSize: 10, color: '#475569', whiteSpace: 'nowrap', userSelect: 'none' }}>{label}</span>
    </div>
  );
}

export default Startinterview;
