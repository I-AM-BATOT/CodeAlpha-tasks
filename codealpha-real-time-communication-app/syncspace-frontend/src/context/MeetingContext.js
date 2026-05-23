import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { getSocket } from '../services/socket';
import { meetingsAPI, messagesAPI, filesAPI } from '../services/api';

const MeetingContext = createContext(null);

export const MeetingProvider = ({ children }) => {
  const [meeting, setMeeting]               = useState(null);
  const [participants, setParticipants]     = useState([]);
  const [messages, setMessages]             = useState([]);
  const [files, setFiles]                   = useState([]);
  const [isMuted, setIsMuted]               = useState(false);
  const [isVideoOff, setIsVideoOff]         = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSpeaker, setActiveSpeaker]   = useState(null);
  const [typingUsers, setTypingUsers]       = useState([]);
  const [inMeeting, setInMeeting]           = useState(false);
  const [localStream, setLocalStream]       = useState(null);
  const [screenStream, setScreenStream]     = useState(null);
  const [remoteStreams, setRemoteStreams]    = useState({});
  const peerConnections                     = useRef({});
  const localVideoRef                       = useRef(null);
  const typingTimeout                       = useRef(null);

  const iceConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] };

  // ── Join ────────────────────────────────────────────────────────────────
  const joinMeeting = useCallback(async (roomId, password) => {
    const { data } = await meetingsAPI.join({ room_id: roomId, password });
    const mtg = data.data;
    setMeeting(mtg);
    // load messages
    const msgRes = await messagesAPI.getAll(mtg.id);
    setMessages(msgRes.data.data || []);
    // load files
    const fRes = await filesAPI.getAll(mtg.id);
    setFiles(fRes.data.data || []);
    // Socket join
    const socket = getSocket();
    if (socket) socket.emit('room:join', { roomId });
    setInMeeting(true);
    return mtg;
  }, []);

  // ── Leave ───────────────────────────────────────────────────────────────
  const leaveMeeting = useCallback(async () => {
    if (!meeting) return;
    const socket = getSocket();
    if (socket) socket.emit('room:leave', { roomId: meeting.room_id });
    try { await meetingsAPI.leave(meeting.id); } catch {}
    // close all peer connections
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
    // stop media
    localStream?.getTracks().forEach(t => t.stop());
    screenStream?.getTracks().forEach(t => t.stop());
    setMeeting(null); setParticipants([]); setMessages([]);
    setFiles([]); setRemoteStreams({}); setLocalStream(null);
    setScreenStream(null); setInMeeting(false); setIsMuted(false);
    setIsVideoOff(false); setIsScreenSharing(false);
  }, [meeting, localStream, screenStream]);

  // ── Media ───────────────────────────────────────────────────────────────
  const startMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (e) {
      console.warn('Media access denied:', e.message);
      return null;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach(t => { t.enabled = isMuted; });
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    const socket = getSocket();
    if (socket && meeting) socket.emit('media:mute', { roomId: meeting.room_id, is_muted: newMuted });
  }, [localStream, isMuted, meeting]);

  const toggleVideo = useCallback(() => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(t => { t.enabled = isVideoOff; });
    const newOff = !isVideoOff;
    setIsVideoOff(newOff);
    const socket = getSocket();
    if (socket && meeting) socket.emit('media:video', { roomId: meeting.room_id, is_video_off: newOff });
  }, [localStream, isVideoOff, meeting]);

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenStream(stream);
      setIsScreenSharing(true);
      stream.getVideoTracks()[0].onended = () => { setIsScreenSharing(false); setScreenStream(null); };
      const socket = getSocket();
      if (socket && meeting) socket.emit('media:screen_share', { roomId: meeting.room_id, is_sharing: true });
      return stream;
    } catch (e) { console.warn('Screen share denied:', e.message); return null; }
  }, [meeting]);

  const stopScreenShare = useCallback(() => {
    screenStream?.getTracks().forEach(t => t.stop());
    setScreenStream(null); setIsScreenSharing(false);
    const socket = getSocket();
    if (socket && meeting) socket.emit('media:screen_share', { roomId: meeting.room_id, is_sharing: false });
  }, [screenStream, meeting]);

  // ── Chat ────────────────────────────────────────────────────────────────
  const sendMessage = useCallback((content, type = 'text') => {
    const socket = getSocket();
    if (socket && meeting) socket.emit('chat:message', { roomId: meeting.room_id, content, type });
  }, [meeting]);

  const sendTyping = useCallback((isTyping) => {
    const socket = getSocket();
    if (socket && meeting) socket.emit('chat:typing', { roomId: meeting.room_id, isTyping });
    if (isTyping) {
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => sendTyping(false), 2000);
    }
  }, [meeting]);

  // ── Socket listeners ────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !inMeeting) return;

    socket.on('room:user_joined', (u) => {
      setParticipants(prev => [...prev.filter(p => p.user_id !== u.userId), { user_id: u.userId, display_name: u.displayName, avatar_url: u.avatarUrl, socket_id: u.socketId }]);
    });
    socket.on('room:user_left', (u) => {
      setParticipants(prev => prev.filter(p => p.user_id !== u.userId));
      setRemoteStreams(prev => { const n = {...prev}; delete n[u.socketId]; return n; });
    });
    socket.on('room:participants', (ps) => setParticipants(ps));
    socket.on('chat:message', (msg) => setMessages(prev => [...prev, msg]));
    socket.on('chat:message_deleted', ({ messageId }) => setMessages(prev => prev.filter(m => m.id !== messageId)));
    socket.on('chat:typing', ({ userId, displayName, isTyping }) => {
      setTypingUsers(prev => isTyping ? [...prev.filter(u => u.id !== userId), { id: userId, name: displayName }] : prev.filter(u => u.id !== userId));
    });
    socket.on('file:new', ({ file }) => setFiles(prev => [file, ...prev]));
    socket.on('media:speaking', ({ socketId, isSpeaking }) => { if (isSpeaking) setActiveSpeaker(socketId); });
    socket.on('media:user_muted', ({ socketId, is_muted }) => {
      setParticipants(prev => prev.map(p => p.socket_id === socketId ? {...p, is_muted} : p));
    });
    socket.on('media:user_video', ({ socketId, is_video_off }) => {
      setParticipants(prev => prev.map(p => p.socket_id === socketId ? {...p, is_video_off} : p));
    });

    // WebRTC
    socket.on('webrtc:offer', async ({ from, offer, user: remoteUser }) => {
      const pc = createPC(from, socket);
      peerConnections.current[from] = pc;
      if (localStream) localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('webrtc:answer', { to: from, answer });
    });
    socket.on('webrtc:answer', async ({ from, answer }) => {
      const pc = peerConnections.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });
    socket.on('webrtc:ice_candidate', async ({ from, candidate }) => {
      const pc = peerConnections.current[from];
      if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(()=>{});
    });

    return () => {
      ['room:user_joined','room:user_left','room:participants','chat:message','chat:message_deleted',
       'chat:typing','file:new','media:speaking','media:user_muted','media:user_video',
       'webrtc:offer','webrtc:answer','webrtc:ice_candidate'].forEach(e => socket.off(e));
    };
  }, [inMeeting, localStream]); // eslint-disable-line

  const createPC = (socketId, socket) => {
    const pc = new RTCPeerConnection(iceConfig);
    pc.onicecandidate = (e) => { if (e.candidate) socket.emit('webrtc:ice_candidate', { to: socketId, candidate: e.candidate }); };
    pc.ontrack = (e) => { setRemoteStreams(prev => ({ ...prev, [socketId]: e.streams[0] })); };
    return pc;
  };

  const initiateCall = useCallback(async (targetSocketId) => {
    const socket = getSocket();
    if (!socket || !localStream) return;
    const pc = createPC(targetSocketId, socket);
    peerConnections.current[targetSocketId] = pc;
    localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('webrtc:offer', { to: targetSocketId, offer });
  }, [localStream]); // eslint-disable-line

  return (
    <MeetingContext.Provider value={{
      meeting, participants, messages, files,
      isMuted, isVideoOff, isScreenSharing, activeSpeaker, typingUsers,
      inMeeting, localStream, screenStream, remoteStreams, localVideoRef,
      joinMeeting, leaveMeeting, startMedia,
      toggleMute, toggleVideo, startScreenShare, stopScreenShare,
      sendMessage, sendTyping, initiateCall,
      setMessages, setFiles,
    }}>
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeeting = () => useContext(MeetingContext);
export default MeetingContext;
