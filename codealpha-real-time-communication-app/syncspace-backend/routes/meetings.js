const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/meetingController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/index');

router.use(authenticate);

router.post('/', [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('max_participants').optional().isInt({ min: 2, max: 200 }),
  validate,
], ctrl.createMeeting);

router.get('/my', ctrl.getUserMeetings);
router.get('/room/:roomId', ctrl.getMeetingByRoom);
router.get('/:id', ctrl.getMeeting);
router.get('/:id/participants', ctrl.getParticipants);

router.post('/join', [
  body('room_id').notEmpty(),
  validate,
], ctrl.joinMeeting);

router.post('/:id/leave', ctrl.leaveMeeting);
router.post('/:id/end', ctrl.endMeeting);
router.patch('/:id/state', ctrl.updateParticipantState);

module.exports = router;
