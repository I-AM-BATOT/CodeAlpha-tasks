const Joi = require('joi');
module.exports = {
  createBoardSchema: Joi.object({
    title: Joi.string().min(1).max(100).required(),
    projectId: Joi.number().required(),
  }),
};