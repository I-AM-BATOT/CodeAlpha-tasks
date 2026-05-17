const router = require('express').Router();
const ctrl = require('../controllers/task.controller');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createTaskSchema, updateTaskSchema } = require('../validators/task.validator');

router.use(auth);
router.get('/:id', ctrl.getOne);
router.post('/', validate(createTaskSchema), ctrl.create);
router.patch('/:id', validate(updateTaskSchema), ctrl.update);
router.patch('/:id/move', ctrl.move);
router.delete('/:id', ctrl.destroy);

module.exports = router;