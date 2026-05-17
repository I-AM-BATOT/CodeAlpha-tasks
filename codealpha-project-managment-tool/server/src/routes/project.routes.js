
const router = require('express').Router();
const ctrl = require('../controllers/project.controller');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createProjectSchema } = require('../validators/project.validator');

router.use(auth);
router.get('/',                     ctrl.getAll);
router.get('/:id',                  ctrl.getOne);
router.post('/',                    validate(createProjectSchema), ctrl.create);
router.post('/:id/invite',          ctrl.invite);
router.get('/:id/members',          ctrl.getMembers);
router.delete('/:id/members/:userId', ctrl.removeMember);
router.delete('/:id',               ctrl.destroy);

module.exports = router;

