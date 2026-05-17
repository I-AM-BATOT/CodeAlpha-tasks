export const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

export const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour:'2-digit', minute:'2-digit' }) : '';

export const isOverdue = (d) => d && new Date(d) < new Date();

export const priorityColor = (p) => ({
  critical: '#E5623A',
  high:     '#FF7F50',
  medium:   '#F59E0B',
  low:      '#6B7280',
}[p] || '#6B7280');

export const priorityBg = (p) => ({
  critical: '#FFF0EB',
  high:     '#FFF5F0',
  medium:   '#FFFBEB',
  low:      '#F3F4F6',
}[p] || '#F3F4F6');

export const initials = (name) =>
  name?.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() || '?';

export const avatarColor = (id) => [
  '#FF7F50','#E5623A','#FF9A76','#F59E0B',
  '#10B981','#6366F1','#EC4899','#8B5CF6',
][id % 8];

export const labelColor = (label) => {
  const colors = [
    { bg:'#FFF0EB', text:'#E5623A' },
    { bg:'#FFFBEB', text:'#B45309' },
    { bg:'#EEF2FF', text:'#4338CA' },
    { bg:'#F0FDF4', text:'#15803D' },
    { bg:'#FDF4FF', text:'#7E22CE' },
    { bg:'#E0F4F4', text:'#006F6F' },
  ];
  const i = Math.abs(label.split('').reduce((a,c) => a + c.charCodeAt(0), 0)) % colors.length;
  return colors[i];
};