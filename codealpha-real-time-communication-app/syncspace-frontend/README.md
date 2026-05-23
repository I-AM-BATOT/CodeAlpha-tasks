# SyncSpace Frontend

React.js + Framer Motion + Tailwind CSS — Real-Time Communication & Collaboration Platform

---

## Quick Start

### Prerequisites
- Node.js v18+
- Backend running on `http://localhost:5000`

### Install & Run
```bash
npm install
npm start        # dev server on http://localhost:3000
npm run build    # production build
```

---

## Pages & Routes

| Route | Page | Auth |
|-------|------|------|
| `/` | Landing Page | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | Dashboard — create/join meetings | ✅ |
| `/meetings` | All meetings list | ✅ |
| `/meeting/:roomId` | Live meeting room | ✅ |
| `/profile` | Profile & password settings | ✅ |
| `/notifications` | Notifications center | ✅ |

---

## Architecture

```
src/
├── App.jsx                        ← Router + route guards
├── index.js                       ← React root
├── index.css                      ← Global styles, Tailwind, glass utilities
│
├── context/
│   ├── AuthContext.js             ← JWT auth state + login/register/logout
│   └── MeetingContext.js          ← WebRTC, media controls, socket events
│
├── services/
│   ├── api.js                     ← Axios instance + all REST API methods
│   └── socket.js                  ← Socket.io client init/disconnect
│
├── hooks/
│   └── useNotifications.js        ← Notifications state + socket listener
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx          ← Sidebar + main content wrapper
│   │   └── Sidebar.jsx            ← Animated collapsible sidebar nav
│   ├── ui/
│   │   ├── Spinner.jsx            ← Loading spinner + full-page loader
│   │   ├── Modal.jsx              ← Animated glass modal
│   │   ├── Tooltip.jsx            ← Hover tooltip
│   │   └── Badge.jsx              ← Status badge
│   ├── meeting/
│   │   ├── VideoTile.jsx          ← Single participant video tile
│   │   ├── MeetingControls.jsx    ← Bottom control bar (mute/video/share/leave)
│   │   └── FilesPanel.jsx         ← File upload + list side panel
│   ├── chat/
│   │   └── ChatPanel.jsx          ← Real-time chat + emoji + typing indicator
│   └── whiteboard/
│       └── Whiteboard.jsx         ← Canvas drawing tool with socket sync
│
└── pages/
    ├── LandingPage.jsx            ← Marketing landing with animated hero
    ├── LoginPage.jsx
    ├── RegisterPage.jsx
    ├── DashboardPage.jsx          ← Stats + create/join meeting modals
    ├── MeetingPage.jsx            ← Full meeting room (video grid + all panels)
    ├── MeetingsPage.jsx           ← Meeting history with filters
    ├── ProfilePage.jsx            ← Edit profile + change password
    └── NotificationsPage.jsx
```

---

## Features Implemented

### ✅ Authentication
- Register, login, logout with JWT
- Protected routes (redirect to /login)
- Profile editing & password change

### ✅ Dashboard
- Animated stats cards (total, active, hosted, participants)
- Create meeting modal (title, description, optional password)
- Join meeting modal (room ID + password)
- Recent meetings grid with status badges

### ✅ Meeting Room
- WebRTC peer connections (offer/answer/ICE via Socket.io)
- Dynamic video grid (1, 2x2, 3x3, 4x4 layouts)
- Camera + mic toggle with visual indicators
- Screen share support
- Active speaker highlighting
- Room ID copy-to-clipboard invite

### ✅ Live Chat
- Real-time messages via Socket.io
- Typing indicators with animated dots
- Emoji picker (10 quick emojis)
- Timestamped messages
- Own vs others bubble styling

### ✅ Whiteboard
- HTML5 Canvas with Pencil, Line, Rectangle, Circle, Text, Eraser tools
- 10 colors + 5 brush sizes
- Real-time sync via Socket.io `whiteboard:draw` events
- Auto-save to backend on mouse-up
- Clear board (broadcast to all)

### ✅ File Sharing
- Drag-and-drop + click upload
- Upload progress bar
- File list with icons by MIME type
- Direct download links
- Real-time file notifications via socket

### ✅ Notifications
- Real-time push via Socket.io
- Mark one / mark all as read
- Unread badge on sidebar

### ✅ UI/UX
- Dark theme (#0F172A background)
- Glassmorphism cards
- Framer Motion on every interaction (page transitions, modals, cards, buttons)
- Collapsible animated sidebar
- Fully responsive (mobile, tablet, desktop)
- Custom scrollbar, Google Fonts (Syne + DM Sans + JetBrains Mono)
- react-hot-toast notifications

---

## Color Palette
| Token | Value | Use |
|-------|-------|-----|
| Brand | `#6C63FF` | Primary actions, active states |
| Violet | `#8B5CF6` | Gradients, secondary |
| Cyan | `#00D4FF` | Accents, highlights |
| Background | `#0F172A` | Page background |
| Surface-1 | `#111827` | Cards |
| Surface-2 | `#161d33` | Panels, modals |
| Text-1 | `#F8FAFC` | Primary text |
| Text-2 | `#94a3b8` | Secondary text |

---

## Environment Variables
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```
