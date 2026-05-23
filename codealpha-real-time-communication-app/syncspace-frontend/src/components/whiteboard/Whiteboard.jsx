import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocket } from '../../services/socket';
import { useMeeting } from '../../context/MeetingContext';
import { whiteboardAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TOOLS = [
  { id:'pencil', icon:'✏️', label:'Draw' },
  { id:'line',   icon:'╱',  label:'Line' },
  { id:'rect',   icon:'▭',  label:'Rectangle' },
  { id:'circle', icon:'◯',  label:'Circle' },
  { id:'text',   icon:'T',  label:'Text' },
  { id:'eraser', icon:'⌫', label:'Eraser' },
];
const COLORS = ['#F8FAFC','#6C63FF','#00D4FF','#8B5CF6','#EC4899','#22c55e','#f59e0b','#ef4444','#0ea5e9','#f97316'];
const SIZES  = [2,4,7,12,20];

export const Whiteboard = ({ onClose }) => {
  const canvasRef   = useRef(null);
  const ctxRef      = useRef(null);
  const isDrawing   = useRef(false);
  const startPos    = useRef({ x:0, y:0 });
  const snapshotRef = useRef(null);
  const { meeting } = useMeeting();
  const socket = getSocket();

  const [tool,  setTool]  = useState('pencil');
  const [color, setColor] = useState('#F8FAFC');
  const [size,  setSize]  = useState(4);
  const [textInput, setTextInput] = useState({ show:false, x:0, y:0, value:'' });

  // Init canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.lineCap   = 'round';
    ctx.lineJoin  = 'round';
    ctxRef.current = ctx;
    // Load saved state
    if (meeting) {
      whiteboardAPI.get(meeting.id).then(({ data }) => {
        if (data.data?.canvas_data) {
          const img = new Image();
          img.onload = () => ctx.drawImage(img, 0, 0);
          img.src = data.data.canvas_data;
        }
      }).catch(()=>{});
    }
  }, []); // eslint-disable-line

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    const onDraw = ({ action }) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      if (action.type === 'draw') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = action.color; ctx.lineWidth = action.size;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(action.x0, action.y0);
        ctx.lineTo(action.x1, action.y1); ctx.stroke();
      } else if (action.type === 'clear') {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      } else if (action.type === 'state') {
        const img = new Image(); img.onload = () => ctx.drawImage(img,0,0); img.src = action.dataUrl;
      }
    };
    const onState = ({ canvas_data }) => {
      const ctx = ctxRef.current;
      if (!ctx || !canvas_data) return;
      const img = new Image(); img.onload = () => ctx.drawImage(img,0,0); img.src = canvas_data;
    };
    const onClear = () => { const ctx = ctxRef.current; if (ctx) ctx.clearRect(0,0,canvasRef.current.width,canvasRef.current.height); };
    socket.on('whiteboard:draw',    onDraw);
    socket.on('whiteboard:state',   onState);
    socket.on('whiteboard:cleared', onClear);
    return () => { socket.off('whiteboard:draw',onDraw); socket.off('whiteboard:state',onState); socket.off('whiteboard:cleared',onClear); };
  }, [socket]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches?.[0];
    return { x:(touch||e).clientX - rect.left, y:(touch||e).clientY - rect.top };
  };

  const onMouseDown = (e) => {
    const pos = getPos(e);
    if (tool === 'text') { setTextInput({ show:true, x:pos.x, y:pos.y, value:'' }); return; }
    isDrawing.current = true;
    startPos.current  = pos;
    if (['rect','circle','line'].includes(tool)) {
      snapshotRef.current = ctxRef.current.getImageData(0,0,canvasRef.current.width,canvasRef.current.height);
    }
    const ctx = ctxRef.current;
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
  };

  const onMouseMove = (e) => {
    if (!isDrawing.current) return;
    const ctx = ctxRef.current;
    const pos = getPos(e);
    ctx.strokeStyle = tool==='eraser' ? '#0F172A' : color;
    ctx.lineWidth   = tool==='eraser' ? size*3 : size;
    ctx.globalCompositeOperation = tool==='eraser' ? 'destination-out' : 'source-over';

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y); ctx.stroke();
      if (socket && meeting) socket.emit('whiteboard:draw', { roomId:meeting.room_id, action:{ type:'draw', color:tool==='eraser'?'#0F172A':color, size: tool==='eraser'?size*3:size, x0:startPos.current.x, y0:startPos.current.y, x1:pos.x, y1:pos.y }});
      startPos.current = pos;
    } else {
      ctx.putImageData(snapshotRef.current, 0, 0);
      const { x:x0, y:y0 } = startPos.current;
      ctx.beginPath();
      if (tool==='line') { ctx.moveTo(x0,y0); ctx.lineTo(pos.x,pos.y); ctx.stroke(); }
      else if (tool==='rect') { ctx.strokeRect(x0,y0,pos.x-x0,pos.y-y0); }
      else if (tool==='circle') { ctx.ellipse(x0,y0,Math.abs(pos.x-x0),Math.abs(pos.y-y0),0,0,Math.PI*2); ctx.stroke(); }
    }
  };

  const onMouseUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    ctxRef.current.closePath();
    autoSave();
  };

  const autoSave = useCallback(() => {
    if (!meeting || !canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    if (socket) socket.emit('whiteboard:save', { roomId:meeting.room_id, canvas_data:dataUrl });
    whiteboardAPI.save(meeting.id, { canvas_data:dataUrl }).catch(()=>{});
  }, [meeting, socket]);

  const clearBoard = () => {
    ctxRef.current.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);
    if (socket && meeting) socket.emit('whiteboard:clear', { roomId:meeting.room_id });
    toast.success('Whiteboard cleared');
  };

  const commitText = () => {
    const ctx = ctxRef.current;
    ctx.font = `${size*4+10}px DM Sans`; ctx.fillStyle = color;
    ctx.fillText(textInput.value, textInput.x, textInput.y);
    setTextInput({ show:false, x:0, y:0, value:'' });
    autoSave();
  };

  return (
    <motion.div initial={{ opacity:0, scale:0.98 }} animate={{ opacity:1, scale:1 }}
      style={{ position:'absolute', inset:0, background:'#0d1220', zIndex:30, display:'flex', flexDirection:'column' }}>

      {/* Toolbar */}
      <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', background:'#111827' }}>
        {/* Tools */}
        <div style={{ display:'flex', gap:4 }}>
          {TOOLS.map(t => (
            <motion.button key={t.id} whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }} title={t.label} onClick={()=>setTool(t.id)}
              style={{ width:36, height:36, borderRadius:8, border:`1px solid ${tool===t.id?'#6C63FF':'rgba(255,255,255,0.1)'}`, background: tool===t.id?'rgba(108,99,255,0.2)':'rgba(255,255,255,0.04)', color: tool===t.id?'#a49cf9':'#64748b', cursor:'pointer', fontSize:t.icon.length===1?16:12, fontWeight:700 }}>
              {t.icon}
            </motion.button>
          ))}
        </div>
        <div style={{ width:1, height:28, background:'rgba(255,255,255,0.1)' }} />
        {/* Colors */}
        <div style={{ display:'flex', gap:4 }}>
          {COLORS.map(c => (
            <motion.button key={c} whileHover={{ scale:1.15 }} whileTap={{ scale:0.9 }} onClick={()=>setColor(c)}
              style={{ width:22, height:22, borderRadius:'50%', background:c, border:`2px solid ${color===c?'#fff':'transparent'}`, cursor:'pointer', boxShadow: color===c?`0 0 8px ${c}`:'none' }} />
          ))}
        </div>
        <div style={{ width:1, height:28, background:'rgba(255,255,255,0.1)' }} />
        {/* Sizes */}
        <div style={{ display:'flex', gap:4, alignItems:'center' }}>
          {SIZES.map(s => (
            <motion.button key={s} whileHover={{ scale:1.1 }} onClick={()=>setSize(s)}
              style={{ width:s===size?28:22, height:s===size?28:22, borderRadius:'50%', background: s===size?color:'rgba(255,255,255,0.15)', border:'none', cursor:'pointer', transition:'all .15s' }} />
          ))}
        </div>
        <div style={{ flex:1 }} />
        <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={clearBoard}
          style={{ padding:'6px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171', borderRadius:8, cursor:'pointer', fontSize:12, fontFamily:'DM Sans,sans-serif', fontWeight:500 }}>
          Clear
        </motion.button>
        {onClose && <motion.button whileHover={{ scale:1.05 }} onClick={onClose}
          style={{ padding:'6px 14px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8', borderRadius:8, cursor:'pointer', fontSize:12, fontFamily:'DM Sans,sans-serif' }}>
          ✕ Close
        </motion.button>}
      </div>

      {/* Canvas */}
      <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
        <canvas ref={canvasRef} style={{ width:'100%', height:'100%', cursor: tool==='eraser'?'cell':tool==='text'?'text':'crosshair', display:'block', background:'#0d1424' }}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          onTouchStart={e=>{e.preventDefault();onMouseDown(e);}} onTouchMove={e=>{e.preventDefault();onMouseMove(e);}} onTouchEnd={onMouseUp} />

        {/* Text input overlay */}
        <AnimatePresence>
          {textInput.show && (
            <motion.input initial={{ opacity:0 }} animate={{ opacity:1 }} autoFocus
              value={textInput.value} onChange={e=>setTextInput(t=>({...t,value:e.target.value}))}
              onKeyDown={e=>{ if(e.key==='Enter') commitText(); if(e.key==='Escape') setTextInput({show:false,x:0,y:0,value:''}); }}
              onBlur={commitText}
              style={{ position:'absolute', left:textInput.x, top:textInput.y-16, background:'transparent', border:'1px dashed rgba(108,99,255,0.5)', outline:'none', color, fontSize:size*4+10, fontFamily:'DM Sans,sans-serif', minWidth:120, padding:'0 4px' }} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
