import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { filesAPI } from '../../services/api';
import { useMeeting } from '../../context/MeetingContext';
import { getSocket } from '../../services/socket';
import { Spinner } from '../ui/Spinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const fileIcon = (mime) => {
  if (!mime) return '📄';
  if (mime.includes('image')) return '🖼️';
  if (mime.includes('pdf')) return '📕';
  if (mime.includes('video')) return '🎬';
  if (mime.includes('audio')) return '🎵';
  if (mime.includes('zip') || mime.includes('rar')) return '📦';
  if (mime.includes('word') || mime.includes('document')) return '📝';
  if (mime.includes('sheet') || mime.includes('excel')) return '📊';
  return '📄';
};

const fmtSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const s = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(bytes)/Math.log(k));
  return `${(bytes/Math.pow(k,i)).toFixed(1)} ${s[i]}`;
};

export const FilesPanel = ({ onClose }) => {
  const { meeting, files, setFiles } = useMeeting();
  const socket = getSocket();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [dragging,  setDragging]  = useState(false);

  const upload = useCallback(async (file) => {
    if (!meeting) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('meeting_id', meeting.id);
    setUploading(true); setProgress(0);
    try {
      const { data } = await filesAPI.upload(fd, setProgress);
      const newFile = data.data;
      setFiles(f => [newFile, ...f]);
      if (socket) socket.emit('file:shared', { roomId: meeting.room_id, file: newFile });
      toast.success('File uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); setProgress(0); }
  }, [meeting, socket, setFiles]);

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) upload(f);
  };

  return (
    <motion.div initial={{ x:320, opacity:0 }} animate={{ x:0, opacity:1 }} exit={{ x:320, opacity:0 }}
      transition={{ type:'spring', stiffness:300, damping:30 }}
      style={{ width:320, height:'100%', background:'#111827', borderLeft:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column', flexShrink:0 }}>

      {/* Header */}
      <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:16 }}>📁</span>
          <h3 style={{ margin:0, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, color:'#F8FAFC' }}>Files</h3>
          <span style={{ background:'rgba(0,212,255,0.1)', color:'#00D4FF', fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:999 }}>{files.length}</span>
        </div>
        {onClose && <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#64748b', width:28, height:28, borderRadius:7, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>}
      </div>

      {/* Upload zone */}
      <div style={{ padding:'12px 16px' }}>
        <motion.div animate={{ borderColor: dragging ? '#6C63FF' : 'rgba(255,255,255,0.1)', background: dragging ? 'rgba(108,99,255,0.05)' : 'rgba(255,255,255,0.02)' }}
          onDragOver={(e)=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={onDrop}
          onClick={()=>!uploading&&inputRef.current?.click()}
          style={{ border:'2px dashed rgba(255,255,255,0.1)', borderRadius:12, padding:'20px 16px', textAlign:'center', cursor:'pointer', transition:'all .2s' }}>
          {uploading ? (
            <div>
              <Spinner size={24} />
              <p style={{ margin:'8px 0 4px', fontSize:13, color:'#94a3b8', fontFamily:'DM Sans,sans-serif' }}>Uploading…</p>
              <div style={{ height:4, background:'rgba(255,255,255,0.08)', borderRadius:999, overflow:'hidden' }}>
                <motion.div animate={{ width:`${progress}%` }} style={{ height:'100%', background:'linear-gradient(90deg,#6C63FF,#00D4FF)', borderRadius:999 }} />
              </div>
            </div>
          ) : (
            <>
              <p style={{ fontSize:24, marginBottom:6 }}>📤</p>
              <p style={{ margin:'0 0 4px', fontSize:13, color:'#94a3b8', fontFamily:'DM Sans,sans-serif', fontWeight:500 }}>Drop or click to upload</p>
              <p style={{ margin:0, fontSize:11, color:'#475569', fontFamily:'DM Sans,sans-serif' }}>Max 50MB</p>
            </>
          )}
        </motion.div>
        <input ref={inputRef} type="file" style={{ display:'none' }} onChange={e=>{ if(e.target.files[0]) upload(e.target.files[0]); e.target.value=''; }} />
      </div>

      {/* Files list */}
      <div style={{ flex:1, overflow:'auto', padding:'0 12px 12px' }}>
        {files.length === 0 ? (
          <div style={{ textAlign:'center', padding:'30px 0' }}>
            <p style={{ fontSize:28, marginBottom:8 }}>📭</p>
            <p style={{ color:'#475569', fontFamily:'DM Sans,sans-serif', fontSize:13 }}>No files shared yet</p>
          </div>
        ) : (
          <AnimatePresence>
            {files.map(f => (
              <motion.div key={f.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                whileHover={{ background:'rgba(255,255,255,0.06)' }}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 8px', borderRadius:10, marginBottom:4, transition:'background .15s' }}>
                <span style={{ fontSize:22, flexShrink:0 }}>{fileIcon(f.mime_type)}</span>
                <div style={{ flex:1, overflow:'hidden' }}>
                  <p style={{ margin:0, fontSize:13, fontWeight:500, color:'#F8FAFC', fontFamily:'DM Sans,sans-serif', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.original_name}</p>
                  <p style={{ margin:0, fontSize:11, color:'#475569', fontFamily:'DM Sans,sans-serif' }}>
                    {fmtSize(f.file_size)} · {format(new Date(f.created_at), 'MMM d, h:mm a')}
                  </p>
                </div>
                <motion.a href={filesAPI.download(f.id)} target="_blank" rel="noreferrer"
                  whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                  style={{ width:30, height:30, borderRadius:8, background:'rgba(108,99,255,0.15)', border:'1px solid rgba(108,99,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none', flexShrink:0 }}>
                  <span style={{ fontSize:14 }}>⬇</span>
                </motion.a>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};
