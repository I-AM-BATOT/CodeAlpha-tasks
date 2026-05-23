import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const VideoTile = ({ stream, displayName, isMuted, isVideoOff, isSpeaking, isLocal, avatarChar }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
      style={{ position:'relative', borderRadius:16, overflow:'hidden', background:'#161d33', border:`2px solid ${isSpeaking ? '#6C63FF' : 'rgba(255,255,255,0.07)'}`, aspectRatio:'16/9', boxShadow: isSpeaking ? '0 0 0 2px #6C63FF, 0 0 20px rgba(108,99,255,0.3)' : '0 4px 16px rgba(0,0,0,0.3)', transition:'border-color .2s, box-shadow .2s' }}>

      {stream && !isVideoOff ? (
        <video ref={videoRef} autoPlay playsInline muted={isLocal}
          style={{ width:'100%', height:'100%', objectFit:'cover', transform: isLocal ? 'scaleX(-1)' : 'none' }} />
      ) : (
        <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#161d33,#111827)' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg,#6C63FF,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, color:'#fff', fontFamily:'Syne,sans-serif', boxShadow:'0 4px 20px rgba(108,99,255,0.4)' }}>
            {avatarChar || displayName?.[0]?.toUpperCase() || '?'}
          </div>
        </div>
      )}

      {/* Name tag */}
      <div style={{ position:'absolute', bottom:10, left:10, display:'flex', alignItems:'center', gap:6 }}>
        <div style={{ padding:'4px 10px', borderRadius:999, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', gap:6 }}>
          {isMuted && <span style={{ fontSize:10, color:'#f87171' }}>🔇</span>}
          <span style={{ fontSize:12, color:'#F8FAFC', fontFamily:'DM Sans,sans-serif', fontWeight:500 }}>{displayName}{isLocal ? ' (You)' : ''}</span>
        </div>
      </div>

      {/* Speaking indicator */}
      {isSpeaking && (
        <div style={{ position:'absolute', top:10, right:10 }}>
          <motion.div animate={{ scale:[1,1.2,1] }} transition={{ repeat:Infinity, duration:0.8 }}
            style={{ width:10, height:10, borderRadius:'50%', background:'#6C63FF', boxShadow:'0 0 8px #6C63FF' }} />
        </div>
      )}

      {/* Video off overlay */}
      {isVideoOff && (
        <div style={{ position:'absolute', top:10, left:10 }}>
          <span style={{ fontSize:12, background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.3)', padding:'3px 8px', borderRadius:999, color:'#f87171', fontFamily:'DM Sans,sans-serif' }}>📷 Off</span>
        </div>
      )}
    </motion.div>
  );
};
