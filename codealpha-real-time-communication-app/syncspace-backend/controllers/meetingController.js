const meetingService = require('../services/meetingService');

exports.createMeeting = async (req, res, next) => {
  try {
    const meeting = await meetingService.createMeeting(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Meeting created', data: meeting });
  } catch (err) { next(err); }
};

exports.getMeeting = async (req, res, next) => {
  try {
    const meeting = await meetingService.getMeetingById(req.params.id);
    res.json({ success: true, data: meeting });
  } catch (err) { next(err); }
};

exports.getMeetingByRoom = async (req, res, next) => {
  try {
    const meeting = await meetingService.getMeetingByRoomId(req.params.roomId);
    res.json({ success: true, data: meeting });
  } catch (err) { next(err); }
};

exports.joinMeeting = async (req, res, next) => {
  try {
    const { room_id, password } = req.body;
    const meeting = await meetingService.joinMeeting(req.user.id, room_id, password);
    res.json({ success: true, message: 'Joined meeting', data: meeting });
  } catch (err) { next(err); }
};

exports.leaveMeeting = async (req, res, next) => {
  try {
    await meetingService.leaveMeeting(req.user.id, req.params.id);
    res.json({ success: true, message: 'Left meeting' });
  } catch (err) { next(err); }
};

exports.endMeeting = async (req, res, next) => {
  try {
    await meetingService.endMeeting(req.user.id, req.params.id);
    res.json({ success: true, message: 'Meeting ended' });
  } catch (err) { next(err); }
};

exports.getParticipants = async (req, res, next) => {
  try {
    const participants = await meetingService.getParticipants(req.params.id);
    res.json({ success: true, data: participants });
  } catch (err) { next(err); }
};

exports.getUserMeetings = async (req, res, next) => {
  try {
    const meetings = await meetingService.getUserMeetings(req.user.id);
    res.json({ success: true, data: meetings });
  } catch (err) { next(err); }
};

exports.updateParticipantState = async (req, res, next) => {
  try {
    await meetingService.updateParticipantState(req.params.id, req.user.id, req.body);
    res.json({ success: true, message: 'State updated' });
  } catch (err) { next(err); }
};
