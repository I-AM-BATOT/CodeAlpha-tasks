const router = require('express').Router();
const ctrl = require('../controllers/board.controller');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createBoardSchema } = require('../validators/board.validator');

router.use(auth);
router.get('/project/:projectId', ctrl.getByProject);
router.post('/', validate(createBoardSchema), ctrl.create);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.destroy);

module.exports = router;