# SyncSpace Backend

Real-Time Communication & Collaboration Platform — Node.js + Express + Socket.io + MySQL

---

## Quick Start

### 1. Prerequisites
- Node.js v18+
- XAMPP (MySQL running on port 3306)

### 2. Create the database
Open phpMyAdmin → run `database_setup.sql`, or:
```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS syncspace CHARACTER SET utf8mb4;"
```

### 3. Configure environment
Edit `.env` — set `DB_PASSWORD` if your MySQL has a password. Everything else works out of the box.

### 4. Install & run
```bash
npm install
npm run dev       # development (nodemon)
npm start         # production
```

Server starts on **http://localhost:5000**

---

## Architecture

```
syncspace-backend/
├── server.js              # Entry point — Express + Socket.io setup
├── config/
│   └── database.js        # MySQL pool + auto schema creation
├── middleware/
│   ├── auth.js            # JWT authenticate + authorizeAdmin
│   └── index.js           # errorHandler, notFound, validate, multer upload
├── services/
│   ├── authService.js     # register, login, logout, profile
│   ├── meetingService.js  # create, join, leave, end meetings
│   ├── contentService.js  # messages, files, whiteboard
│   └── notificationService.js
├── controllers/
│   ├── authController.js
│   ├── meetingController.js
│   └── contentController.js
├── routes/
│   ├── auth.js
│   ├── meetings.js
│   └── content.js
├── socket/
│   └── index.js           # All Socket.io events
└── uploads/               # File storage
```

---

## REST API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, receive JWT |
| POST | `/api/auth/logout` | ✅ | Logout |
| GET | `/api/auth/profile` | ✅ | Get own profile |
| PUT | `/api/auth/profile` | ✅ | Update profile |
| PUT | `/api/auth/change-password` | ✅ | Change password |

### Meetings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/meetings` | Create meeting |
| GET | `/api/meetings/my` | Get user's meetings |
| GET | `/api/meetings/:id` | Get meeting by ID |
| GET | `/api/meetings/room/:roomId` | Get meeting by room ID |
| GET | `/api/meetings/:id/participants` | List participants |
| POST | `/api/meetings/join` | Join meeting |
| POST | `/api/meetings/:id/leave` | Leave meeting |
| POST | `/api/meetings/:id/end` | End meeting (host only) |
| PATCH | `/api/meetings/:id/state` | Update media state |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meetings/:meetingId/messages` | Get chat history |
| DELETE | `/api/messages/:messageId` | Delete own message |

### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/files/upload` | Upload file (multipart/form-data) |
| GET | `/api/meetings/:meetingId/files` | List meeting files |
| GET | `/api/files/:fileId/download` | Download file |

### Whiteboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meetings/:meetingId/whiteboard` | Get saved state |
| PUT | `/api/meetings/:meetingId/whiteboard` | Save canvas data |
| DELETE | `/api/meetings/:meetingId/whiteboard` | Clear whiteboard |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get all notifications |
| PATCH | `/api/notifications/:id/read` | Mark one as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |

---

## Socket.io Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `room:join` | `{ roomId }` | Join a meeting room |
| `room:leave` | `{ roomId }` | Leave a meeting room |
| `webrtc:offer` | `{ to, offer }` | WebRTC offer to peer |
| `webrtc:answer` | `{ to, answer }` | WebRTC answer to peer |
| `webrtc:ice_candidate` | `{ to, candidate }` | ICE candidate |
| `media:mute` | `{ roomId, is_muted }` | Toggle mute |
| `media:video` | `{ roomId, is_video_off }` | Toggle video |
| `media:screen_share` | `{ roomId, is_sharing }` | Screen share state |
| `media:speaking` | `{ roomId, isSpeaking }` | Active speaker |
| `chat:message` | `{ roomId, content, type }` | Send chat message |
| `chat:typing` | `{ roomId, isTyping }` | Typing indicator |
| `chat:delete` | `{ messageId }` | Delete message |
| `whiteboard:draw` | `{ roomId, action }` | Draw action |
| `whiteboard:save` | `{ roomId, canvas_data }` | Persist whiteboard |
| `whiteboard:clear` | `{ roomId }` | Clear whiteboard |
| `whiteboard:cursor` | `{ roomId, x, y }` | Cursor position |
| `file:shared` | `{ roomId, file }` | Notify file upload |
| `notification:meeting_invite` | `{ targetUserId, meetingId }` | Send invite |

### Server → Client
| Event | Description |
|-------|-------------|
| `room:user_joined` | A user joined |
| `room:user_left` | A user left |
| `room:participants` | Full participants list |
| `room:user_count` | Current count |
| `webrtc:offer/answer/ice_candidate` | Forwarded signaling |
| `media:user_muted/video/screen_share/speaking` | Media state updates |
| `chat:message` | New message (with DB id) |
| `chat:typing` | Someone typing |
| `chat:message_deleted` | Message removed |
| `whiteboard:draw` | Draw action from peer |
| `whiteboard:state` | Full canvas state |
| `whiteboard:cleared` | Board was cleared |
| `whiteboard:cursor` | Peer cursor position |
| `file:new` | New file uploaded |
| `notification:new` | New notification |

---

## Security
- JWT (7-day expiry, HS256)
- bcrypt (12 salt rounds) for passwords
- Helmet.js HTTP headers
- CORS restricted to frontend origin
- Rate limiting: 100 req/15min global, 20 req/15min on auth
- File type blocking (.exe, .bat, .sh, etc.)
- 50MB file size limit
- Input validation on all endpoints (express-validator)
