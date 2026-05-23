const contentService = require('../services/contentService');
const notificationService = require('../services/notificationService');
const path = require('path');
const fs = require('fs');

// ─── Messages ────────────────────────────────────────────────────────────────
exports.getMessages = async (req, res, next) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const messages = await contentService.getMessages(req.params.meetingId, parseInt(limit), parseInt(offset));
    res.json({ success: true, data: messages });
  } catch (err) { next(err); }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    await contentService.deleteMessage(req.params.messageId, req.user.id);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) { next(err); }
};

// ─── Files ───────────────────────────────────────────────────────────────────
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const record = await contentService.saveFileRecord({
      meeting_id: req.body.meeting_id,
      uploader_id: req.user.id,
      originalname: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
    res.status(201).json({ success: true, message: 'File uploaded', data: record });
  } catch (err) { next(err); }
};

exports.getMeetingFiles = async (req, res, next) => {
  try {
    const files = await contentService.getMeetingFiles(req.params.meetingId);
    res.json({ success: true, data: files });
  } catch (err) { next(err); }
};

exports.downloadFile = async (req, res, next) => {
  try {
    const file = await contentService.getFileById(req.params.fileId);
    await contentService.incrementDownload(file.id);
    const absPath = path.join(__dirname, '..', file.file_path);
    if (!fs.existsSync(absPath)) {
      return res.status(404).json({ success: false, message: 'File not found on disk' });
    }
    res.download(absPath, file.original_name);
  } catch (err) { next(err); }
};

// ─── Whiteboard ───────────────────────────────────────────────────────────────
exports.getWhiteboard = async (req, res, next) => {
  try {
    const data = await contentService.getWhiteboardData(req.params.meetingId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.saveWhiteboard = async (req, res, next) => {
  try {
    await contentService.saveWhiteboardData(req.params.meetingId, req.body.canvas_data, req.user.id);
    res.json({ success: true, message: 'Whiteboard saved' });
  } catch (err) { next(err); }
};

exports.clearWhiteboard = async (req, res, next) => {
  try {
    await contentService.clearWhiteboard(req.params.meetingId);
    res.json({ success: true, message: 'Whiteboard cleared' });
  } catch (err) { next(err); }
};

// ─── Notifications ────────────────────────────────────────────────────────────
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    const unread = await notificationService.getUnreadCount(req.user.id);
    res.json({ success: true, data: { notifications, unread_count: unread } });
  } catch (err) { next(err); }
};

exports.markRead = async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user.id);
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) { next(err); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json({ success: true, message: 'All marked as read' });
  } catch (err) { next(err); }
};
