import { motion } from 'framer-motion';
export const Spinner = ({ size = 24, color = '#6C63FF' }) => (
  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
    style={{ width: size, height: size, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: color, borderRadius: '50%' }} />
);
export const PageLoader = () => (
  <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'#0F172A',zIndex:9999}}>
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16}}>
      <motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:1,ease:'linear'}}
        style={{width:56,height:56,border:'3px solid rgba(108,99,255,0.2)',borderTopColor:'#6C63FF',borderRadius:'50%'}} />
      <p style={{color:'#6C63FF',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:20,letterSpacing:4,margin:0}}>SYNCSPACE</p>
    </div>
  </div>
);
