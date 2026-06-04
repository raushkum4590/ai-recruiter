"use client"
import React, { useContext, useEffect, useState } from 'react'
import { Clock, Info, Loader2, Video, Wifi, Shield, Mic, Camera } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/services/superbaseClient'
import { InterviewDataContext } from '@/context/InterViewDataContext'

function Interview() {
  const { interview_id } = useParams();
  const [interviewData, setInterviewData] = useState();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const { setInterviewInfo } = useContext(InterviewDataContext);
  const [error, setError] = useState('');
  const [fetchLoading, setFetchLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (!interview_id) {
      setError('Interview ID is missing or invalid');
      setFetchLoading(false);
      return;
    }
    GetInterviewDetail();
  }, [interview_id]);

  const GetInterviewDetail = async () => {
    setFetchLoading(true);
    try {
      if (!interview_id || interview_id === 'undefined') {
        throw new Error('Invalid interview ID format');
      }

      let { data: Interviews, error: dbError } = await supabase
        .from('Interviews')
        .select("jobPosition,jobDescription,duration,type")
        .eq('interview_id', interview_id);

      if (dbError) throw new Error('Failed to fetch interview details');

      if (!Interviews || Interviews.length === 0) {
        setError('Interview not found. Please check the URL and try again.');
        setFetchLoading(false);
        return;
      }

      setInterviewData(Interviews[0]);
      setFetchLoading(false);
    } catch (e) {
      setError(e.message || 'An error occurred while fetching interview details');
      setFetchLoading(false);
    }
  };

  const onJoinInterview = async () => {
    setLoading(true);
    try {
      if (!userName.trim()) throw new Error('Please enter your name');
      if (!userEmail.trim()) throw new Error('Please enter your email');
      if (!interview_id) throw new Error('Invalid interview ID');

      let { data: Interviews, error } = await supabase
        .from('Interviews')
        .select('*')
        .eq('interview_id', interview_id);

      if (error) throw new Error('Failed to fetch interview data');
      if (!Interviews || Interviews.length === 0) throw new Error('Interview not found');

      setInterviewInfo({
        userName: userName,
        userEmail: userEmail,
        interviewData: Interviews[0]
      });

      router.push(`/interview/${interview_id}/start`);
    } catch (error) {
      alert(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // ── Error State ──
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', sans-serif", color: '#fff', padding: 20,
      }}>
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 20, padding: '40px 48px', maxWidth: 440, width: '100%', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#fca5a5' }}>Interview Not Found</h2>
          <p style={{ color: '#94a3b8', marginBottom: 24, lineHeight: 1.6 }}>{error}</p>
          <p style={{ fontSize: 13, color: '#64748b' }}>Please contact the interviewer for a valid link.</p>
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>
      </div>
    );
  }

  // ── Loading State ──
  if (fetchLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', sans-serif", color: '#fff',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid rgba(99,102,241,0.3)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading interview details...</p>
        </div>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        `}</style>
      </div>
    );
  }

  // ── Main Join Page ──
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 60%, #24243e 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", color: '#fff',
      padding: '20px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', top: '-15%', left: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-15%', right: '-10%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{
        width: '100%', maxWidth: 520,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24, overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        position: 'relative',
      }}>
        {/* Top accent bar */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)' }} />

        <div style={{ padding: '36px 40px 40px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: 10, padding: '6px 16px', fontSize: 12,
              fontWeight: 800, letterSpacing: 1.5, marginBottom: 16,
            }}>
              🤖 AI INTERVIEW
            </div>

            <div style={{
              width: 80, height: 80,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
              border: '2px solid rgba(99,102,241,0.3)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: 32,
            }}>
              💼
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px', letterSpacing: -0.3 }}>
              {interviewData?.jobPosition || 'Interview Session'}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#94a3b8', fontSize: 13 }}>
              <Clock size={13} color="#6366f1" />
              <span>Duration: <strong style={{ color: '#a5b4fc' }}>{interviewData?.duration || 'N/A'}</strong></span>
            </div>
          </div>

          {/* Form */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1.2, marginBottom: 8 }}>
              YOUR NAME
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && userName && onJoinInterview()}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12, padding: '12px 16px',
                color: '#fff', fontSize: 14, outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1.2, marginBottom: 8 }}>
              YOUR EMAIL
            </label>
            <input
              type="email"
              placeholder="e.g. john@gmail.com"
              value={userEmail}
              onChange={e => setUserEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && userName && onJoinInterview()}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12, padding: '12px 16px',
                color: '#fff', fontSize: 14, outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
            />
          </div>

          {/* Info box */}
          <div style={{
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 14, padding: '16px 18px',
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Info size={14} color="#6366f1" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#a5b4fc', letterSpacing: 0.5 }}>Before You Begin</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: <Wifi size={12} />, text: 'Ensure you have a stable internet connection' },
                { icon: <Mic size={12} />, text: 'Allow microphone access when prompted' },
                { icon: <Camera size={12} />, text: 'Be in a quiet and well-lit environment' },
                { icon: <Shield size={12} />, text: 'Your responses are recorded & reviewed by AI' },
              ].map(({ icon, text }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#94a3b8' }}>
                  <span style={{ color: '#6366f1', flexShrink: 0 }}>{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Join button */}
          <button
            disabled={loading || !userName || !userEmail}
            onClick={onJoinInterview}
            style={{
              width: '100%',
              background: loading || !userName || !userEmail
                ? 'rgba(99,102,241,0.3)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', color: '#fff', borderRadius: 14,
              padding: '14px',
              fontWeight: 700, fontSize: 15,
              cursor: loading || !userName || !userEmail ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: loading || !userName || !userEmail ? 'none' : '0 8px 32px rgba(99,102,241,0.5)',
              transition: 'all 0.25s',
              letterSpacing: 0.3,
            }}
            onMouseEnter={e => { if (!loading && userName && userEmail) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.65)'; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.5)'; }}
          >
            {loading ? (
              <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Joining...</>
            ) : (
              <><Video size={18} /> Join Interview Room</>
            )}
          </button>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#475569', marginTop: 16 }}>
            Powered by AI · Secure · Private
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        input::placeholder { color: #475569; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

export default Interview;
