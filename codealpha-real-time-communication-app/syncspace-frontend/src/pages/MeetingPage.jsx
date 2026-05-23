import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MeetingProvider, useMeeting } from '../context/MeetingContext';
import { VideoTile } from '../components/meeting/VideoTile';
import { MeetingControls } from '../components/meeting/MeetingControls';
import { ChatPanel } from '../components/chat/ChatPanel';
import { FilesPanel } from '../components/meeting/FilesPanel';
import { Whiteboard } from '../components/whiteboard/Whiteboard';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function MeetingRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { meeting, participants, joinMeeting, startMedia, localStream, remoteStreams, isMuted, isVideoOff, isScreenSharing, screenStream, activeSpeaker, inMeeting, leaveMeeting } = useMeeting();

  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [showChat, setShowChat]       = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showFiles, setShowFiles]     = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [password, setPassword]       = useState('');
  const [joining, setJoining]         = useState(false);

  const join = useCallback(async (pwd='') => {
    setJoining(true);
    try {
      await joinMeeting(roomId, pwd);
      await startMedia();
      setLoading(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (msg?.toLowerCase().includes('password')) { setPasswordModal(true); setLoading(false); }
      else { setError(msg); setLoading(false); }
    } finally { setJoining(false); }
  }, [roomId, joinMeeting, startMedia]);

  useEffect(() => { join(); }, []); // eslint-disable-line

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordModal(false);
    setLoading(true);
    await join(password);
  };

  // Leave → go to dashboard
  useEffect(() => {
    if (!inMeeting && !loading && !error && !passwordModal) {
      // already left
    }
  }, [inMeeting, loading, error, passwordModal]);

  // eslint-disable-next-line
  const handleLeave = async () => {
    await leaveMeeting();
    navigate('/dashboard');
    toast.success('You left the meeting');
  };

  if (loading) return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#0F172A', gap:16 }}>
      <Spinner size={48} />
      <p style={{ color:'#94a3b8', fontFamily:'DM Sans,sans-serif', fontSize:15 }}>Connecting to meeting…</p>
    </div>
  );

  if (error) return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#0F172A', gap:16 }}>
      <p style={{ fontSize:48 }}>⚠️</p>
      <p style={{ color:'#f87171', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:20 }}>{error}</p>
      <button className="btn-primary" onClick={() => navigate('/dashboard')}>← Dashboard</button>
    </div>
  );

  const allParticipants = [
    { id:'local', stream: isScreenSharing ? screenStream : localStream, displayName: user?.display_name, isMuted, isVideoOff, isLocal:true },
    ...participants.map(p => ({ id:p.socket_id||p.user_id, stream: remoteStreams[p.socket_id], displayName: p.display_name, isMuted: p.is_muted, isVideoOff: p.is_video_off, isLocal:false })),
  ];

  const gridCols = allParticipants.length <= 1 ? 1 : allParticipants.length <= 4 ? 2 : allParticipants.length <= 9 ? 3 : 4;

  return (
    <div style={{ height:'100vh', background:'#0d1424', display:'flex', overflow:'hidden', position:'relative' }}>

      {/* Main video area */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>

        {/* Header */}
        <motion.div initial={{ y:-40, opacity:0 }} animate={{ y:0, opacity:1 }}
          style={{ padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(17,24,39,0.8)', backdropFilter:'blur(10px)', zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 8px #22c55e', animation:'pulse 2s infinite' }} />
            <div>
              <h2 style={{ margin:0, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#F8FAFC' }}>{meeting?.title || 'Meeting'}</h2>
              <p style={{ margin:0, fontSize:11, color:'#64748b', fontFamily:'JetBrains Mono,monospace', letterSpacing:1 }}>{meeting?.room_id}</p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:12, color:'#64748b', fontFamily:'DM Sans,sans-serif' }}>◉ {allParticipants.length} participant{allParticipants.length !== 1 ? 's' : ''}</span>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
              style={{ padding:'6px 12px', background:'rgba(108,99,255,0.1)', border:'1px solid rgba(108,99,255,0.2)', borderRadius:8, color:'#a49cf9', fontFamily:'DM Sans,sans-serif', fontSize:12, cursor:'pointer' }}>
              🔗 Invite
            </button>
          </div>
        </motion.div>

        {/* Video grid */}
        <div style={{ flex:1, overflow:'auto', padding:16 }}>
          {showWhiteboard ? (
            <div style={{ height:'100%', position:'relative' }}>
              <Whiteboard onClose={() => setShowWhiteboard(false)} />
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:`repeat(${gridCols},1fr)`, gap:12, height:'100%', alignContent:'start' }}>
              <AnimatePresence>
                {allParticipants.map(p => (
                  <VideoTile key={p.id} stream={p.stream} displayName={p.displayName} isMuted={p.isMuted}
                    isVideoOff={p.isVideoOff} isLocal={p.isLocal} isSpeaking={activeSpeaker === p.id}
                    avatarChar={p.displayName?.[0]?.toUpperCase()} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Controls */}
        <MeetingControls
          onToggleChat={()=>{ setShowChat(v=>!v); setShowFiles(false); }}
          onToggleWhiteboard={()=>setShowWhiteboard(v=>!v)}
          onToggleFiles={()=>{ setShowFiles(v=>!v); setShowChat(false); }}
          chatOpen={showChat} whiteboardOpen={showWhiteboard} />
      </div>

      {/* Side panels */}
      <AnimatePresence>
        {showChat  && <ChatPanel  onClose={()=>setShowChat(false)} />}
        {showFiles && <FilesPanel onClose={()=>setShowFiles(false)} />}
      </AnimatePresence>

      {/* Password modal */}
      <Modal open={passwordModal} onClose={()=>{ setPasswordModal(false); navigate('/dashboard'); }} title="Password Required">
        <form onSubmit={handlePasswordSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <p style={{ margin:0, color:'#94a3b8', fontFamily:'DM Sans,sans-serif', fontSize:14 }}>This meeting requires a password to join.</p>
          <input className="input-field" type="password" placeholder="Enter meeting password" autoFocus
            value={password} onChange={e=>setPassword(e.target.value)} required />
          <div style={{ display:'flex', gap:10 }}>
            <button type="button" className="btn-ghost" style={{ flex:1 }} onClick={()=>{ setPasswordModal(false); navigate('/dashboard'); }}>Cancel</button>
            <motion.button type="submit" className="btn-primary" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
              whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} disabled={joining}>
              {joining ? <><Spinner size={16} color="#fff" /> Joining…</> : 'Join Meeting'}
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function MeetingPage() {
  return <MeetingProvider><MeetingRoom /></MeetingProvider>;
}
