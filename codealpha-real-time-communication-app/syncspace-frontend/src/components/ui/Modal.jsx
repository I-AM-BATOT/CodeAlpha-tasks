import { motion, AnimatePresence } from 'framer-motion';
export const Modal = ({ open, onClose, children, title, size='md' }) => {
  const widths = { sm:'400px', md:'520px', lg:'700px', xl:'920px' };
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          onClick={(e)=>{ if(e.target===e.currentTarget) onClose?.(); }}
          style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',padding:16,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(8px)',zIndex:1000}}>
          <motion.div initial={{opacity:0,scale:0.92,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.92,y:16}}
            transition={{type:'spring',stiffness:380,damping:28}}
            style={{width:'100%',maxWidth:widths[size],maxHeight:'90vh',overflow:'auto',background:'#161d33',border:'1px solid rgba(255,255,255,0.1)',borderRadius:20,boxShadow:'0 24px 80px rgba(0,0,0,0.6)'}}>
            {title && (
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px 0',marginBottom:20,borderBottom:'1px solid rgba(255,255,255,0.06)',paddingBottom:16}}>
                <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:18,color:'#F8FAFC',margin:0}}>{title}</h3>
                <button onClick={onClose} style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',color:'#94a3b8',width:32,height:32,borderRadius:8,cursor:'pointer',fontSize:20,display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}>×</button>
              </div>
            )}
            <div style={{padding:'0 24px 24px'}}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
