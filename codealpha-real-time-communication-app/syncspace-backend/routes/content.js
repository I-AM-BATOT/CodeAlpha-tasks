const router = require('express').Router();
const ctrl = require('../controllers/contentController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/index');

router.use(authenticate);

// Messages
router.get('/meetings/:meetingId/messages', ctrl.getMessages);
router.delete('/messages/:messageId', ctrl.deleteMessage);

// Files
router.post('/files/upload', upload.single('file'), ctrl.uploadFile);
router.get('/meetings/:meetingId/files', ctrl.getMeetingFiles);
router.get('/files/:fileId/download', ctrl.downloadFile);

// Whiteboard
router.get('/meetings/:meetingId/whiteboard', ctrl.getWhiteboard);
router.put('/meetings/:meetingId/whiteboard', ctrl.saveWhiteboard);
router.delete('/meetings/:meetingId/whiteboard', ctrl.clearWhiteboard);

// Notifications
router.get('/notifications', ctrl.getNotifications);
router.patch('/notifications/:id/read', ctrl.markRead);
router.patch('/notifications/read-all', ctrl.markAllRead);

module.exports = router;
