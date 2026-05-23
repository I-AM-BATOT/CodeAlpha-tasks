export const Badge = ({ children, color='brand' }) => {
  const bg = {brand:'rgba(108,99,255,0.15)',green:'rgba(34,197,94,0.15)',red:'rgba(239,68,68,0.15)',yellow:'rgba(234,179,8,0.15)',cyan:'rgba(0,212,255,0.15)'};
  const tx = {brand:'#a49cf9',green:'#4ade80',red:'#f87171',yellow:'#facc15',cyan:'#00D4FF'};
  return <span style={{display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:999,fontSize:11,fontWeight:600,fontFamily:'DM Sans,sans-serif',background:bg[color],color:tx[color],letterSpacing:0.5}}>{children}</span>;
};
