import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMeeting } from '../../context/MeetingContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const EMOJIS = ['😀','😂','❤️','👍','🎉','🔥','💡','👏','🤔','😎'];

export const ChatPanel = ({ onClose }) => {
  const { messages, sendMessage, sendTyping, typingUsers } = useMeeting();
  const { user } = useAuth();
  const [input, setInput]       = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
    sendTyping(false);
    setShowEmoji(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    else sendTyping(true);
  };

  return (
    <motion.div initial={{ x:320, opacity:0 }} animate={{ x:0, opacity:1 }} exit={{ x:320, opacity:0 }}
      transition={{ type:'spring', stiffness:300, damping:30 }}
      style={{ width:320, height:'100%', background:'#111827', borderLeft:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column', flexShrink:0 }}>

      {/* Header */}
      <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:16 }}>◫</span>
          <h3 style={{ margin:0, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, color:'#F8FAFC' }}>Chat</h3>
          <span style={{ background:'rgba(108,99,255,0.15)', color:'#a49cf9', fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:999 }}>{messages.length}</span>
        </div>
        {onClose && <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#64748b', width:28, height:28, borderRadius:7, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>}
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflow:'auto', padding:'16px 16px 8px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign:'center', paddingTop:40 }}>
            <p style={{ fontSize:28, marginBottom:8 }}>💬</p>
            <p style={{ color:'#475569', fontFamily:'DM Sans,sans-serif', fontSize:13 }}>No messages yet. Say hi!</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isOwn = msg.sender_id === user?.id;
            const showAvatar = !isOwn && (i === 0 || messages[i-1]?.sender_id !== msg.sender_id);
            return (
              <motion.div key={msg.id} initial={{ opacity:0, y:10, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }}
                style={{ display:'flex', flexDirection: isOwn ? 'row-reverse' : 'row', gap:8, marginBottom:8, alignItems:'flex-end' }}>
                {!isOwn && (
                  <div style={{ width:28, height:28, flexShrink:0 }}>
                    {showAvatar && (
                      <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#6C63FF,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', fontFamily:'Syne,sans-serif' }}>
                        {msg.sender_name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
                <div style={{ maxWidth:'75%' }}>
                  {!isOwn && showAvatar && <p style={{ margin:'0 0 3px 4px', fontSize:11, color:'#64748b', fontFamily:'DM Sans,sans-serif', fontWeight:500 }}>{msg.sender_name}</p>}
                  <div style={{ padding:'9px 13px', borderRadius: isOwn ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: isOwn ? 'linear-gradient(135deg,#6C63FF,#8B5CF6)' : 'rgba(255,255,255,0.07)', border: isOwn ? 'none' : '1px solid rgba(255,255,255,0.08)', boxShadow:'0 2px 8px rgba(0,0,0,0.2)' }}>
                    <p style={{ margin:0, fontSize:13, color:'#F8FAFC', fontFamily:'DM Sans,sans-serif', lineHeight:1.45, wordBreak:'break-word' }}>{msg.content}</p>
                  </div>
                  <p style={{ margin:'3px 0 0', fontSize:10, color:'#475569', fontFamily:'DM Sans,sans-serif', textAlign: isOwn ? 'right' : 'left', padding:'0 4px' }}>
                    {format(new Date(msg.created_at), 'h:mm a')}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {typingUsers.length > 0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 8px' }}>
            <div style={{ display:'flex', gap:3 }}>
              {[0,1,2].map(i => <motion.div key={i} animate={{ y:[0,-4,0] }} transition={{ repeat:Infinity, duration:0.8, delay:i*0.15 }} style={{ width:5, height:5, borderRadius:'50%', background:'#6C63FF' }} />)}
            </div>
            <span style={{ fontSize:11, color:'#64748b', fontFamily:'DM Sans,sans-serif' }}>{typingUsers.map(u=>u.name).join(', ')} typing…</span>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Emoji picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:10 }}
            style={{ padding:'10px 16px', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', flexWrap:'wrap', gap:6 }}>
            {EMOJIS.map(e => (
              <motion.button key={e} whileHover={{ scale:1.3 }} whileTap={{ scale:0.9 }}
                onClick={() => { sendMessage(e, 'emoji'); setShowEmoji(false); }}
                style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, padding:2, borderRadius:6 }}>
                {e}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', gap:8, alignItems:'flex-end' }}>
        <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }} onClick={()=>setShowEmoji(v=>!v)}
          style={{ background: showEmoji ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'8px 10px', cursor:'pointer', fontSize:16, flexShrink:0 }}>
          😊
        </motion.button>
        <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
          placeholder="Type a message…" rows={1}
          style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'9px 12px', color:'#F8FAFC', fontFamily:'DM Sans,sans-serif', fontSize:13, resize:'none', outline:'none', lineHeight:1.5, maxHeight:100, overflow:'auto' }} />
        <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={send} disabled={!input.trim()}
          style={{ background: input.trim() ? 'linear-gradient(135deg,#6C63FF,#8B5CF6)' : 'rgba(255,255,255,0.05)', border:'none', borderRadius:10, padding:'9px 14px', cursor: input.trim() ? 'pointer' : 'not-allowed', color: input.trim() ? '#fff' : '#475569', flexShrink:0, fontSize:15 }}>
          ⬆
        </motion.button>
      </div>
    </motion.div>
  );
};
