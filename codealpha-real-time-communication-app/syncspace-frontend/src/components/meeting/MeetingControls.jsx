import { motion } from 'framer-motion';
import { useMeeting } from '../../context/MeetingContext';
import { Tooltip } from '../../components/ui/Tooltip';

export const MeetingControls = ({ onToggleChat, onToggleWhiteboard, onToggleFiles, chatOpen, whiteboardOpen }) => {
  const { isMuted, isVideoOff, isScreenSharing, toggleMute, toggleVideo, startScreenShare, stopScreenShare, leaveMeeting } = useMeeting();

  const controls = [
    { icon: isMuted ? '🔇' : '🎤', label: isMuted ? 'Unmute' : 'Mute', action: toggleMute, active: isMuted, danger: isMuted },
    { icon: isVideoOff ? '📷' : '🎥', label: isVideoOff ? 'Start Video' : 'Stop Video', action: toggleVideo, active: isVideoOff, danger: isVideoOff },
    { icon: '🖥️', label: isScreenSharing ? 'Stop Sharing' : 'Share Screen', action: isScreenSharing ? stopScreenShare : startScreenShare, active: isScreenSharing },
    { icon: '💬', label: chatOpen ? 'Close Chat' : 'Open Chat', action: onToggleChat, active: chatOpen },
    { icon: '✏️', label: whiteboardOpen ? 'Close Board' : 'Whiteboard', action: onToggleWhiteboard, active: whiteboardOpen },
    { icon: '📁', label: 'Files', action: onToggleFiles, active: false },
  ];

  return (
    <div style={{ position:'absolute', bottom:24, left:'50%', transform:'translateX(-50%)', zIndex:20, display:'flex', gap:10, alignItems:'center', padding:'12px 20px', background:'rgba(15,23,42,0.9)', backdropFilter:'blur(20px)', borderRadius:24, border:'1px solid rgba(255,255,255,0.1)', boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>
      {controls.map(c => (
        <Tooltip key={c.label} text={c.label}>
          <motion.button whileHover={{ scale:1.1, y:-2 }} whileTap={{ scale:0.9 }} onClick={c.action}
            style={{ width:48, height:48, borderRadius:14, border:`1px solid ${c.active ? 'rgba(108,99,255,0.4)' : c.danger ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`, background: c.active ? 'rgba(108,99,255,0.2)' : c.danger ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)', cursor:'pointer', fontSize:20, display:'flex', alignItems:'center', justifyContent:'center', boxShadow: c.active ? '0 0 16px rgba(108,99,255,0.2)' : 'none', transition:'all .15s' }}>
            {c.icon}
          </motion.button>
        </Tooltip>
      ))}

      {/* Divider */}
      <div style={{ width:1, height:36, background:'rgba(255,255,255,0.1)', margin:'0 4px' }} />

      {/* Leave */}
      <Tooltip text="Leave Meeting">
        <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }} onClick={leaveMeeting}
          style={{ width:48, height:48, borderRadius:14, border:'1px solid rgba(239,68,68,0.4)', background:'linear-gradient(135deg,#ef4444,#dc2626)', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(239,68,68,0.3)', color:'#fff' }}>
          ✕
        </motion.button>
      </Tooltip>
    </div>
  );
};
