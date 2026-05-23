import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
export const Tooltip = ({ children, text, position='top' }) => {
  const [show, setShow] = useState(false);
  const pos = { top:{bottom:'calc(100% + 8px)',left:'50%',transform:'translateX(-50%)'}, bottom:{top:'calc(100% + 8px)',left:'50%',transform:'translateX(-50%)'}, left:{right:'calc(100% + 8px)',top:'50%',transform:'translateY(-50%)'}, right:{left:'calc(100% + 8px)',top:'50%',transform:'translateY(-50%)'} };
  return (
    <div style={{position:'relative',display:'inline-flex'}} onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div initial={{opacity:0,scale:0.85}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.85}} transition={{duration:0.12}}
            style={{position:'absolute',zIndex:200,pointerEvents:'none',whiteSpace:'nowrap',background:'rgba(17,24,39,0.97)',border:'1px solid rgba(255,255,255,0.12)',padding:'5px 10px',borderRadius:8,fontSize:12,color:'#F8FAFC',fontFamily:'DM Sans,sans-serif',boxShadow:'0 4px 16px rgba(0,0,0,0.4)',...pos[position]}}>
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
