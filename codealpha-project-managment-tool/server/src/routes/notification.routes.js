
const router = require('express').Router();
const ctrl = require('../controllers/notification.controller');
const auth = require('../middleware/auth.middleware');

router.use(auth);
router.get('/', ctrl.getAll);
router.patch('/read-all', ctrl.markAllRead);
router.patch('/:id/read', ctrl.markOneRead);

// Test route — visit this in browser to manually create a notification
// GET /api/v1/notifications/test
router.get('/test', auth, async (req, res) => {
  const notifRepo = require('../repositories/notification.repository');
  const { success } = require('../utils/response');
  try {
    const n = await notifRepo.create({
      userId: req.user.id,
      text: `Test notification created at ${new Date().toLocaleTimeString()}`,
      taskId: null,
    });
    success(res, n, 'Test notification created');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

