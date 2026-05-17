const Joi = require('joi');
module.exports = {
  createCommentSchema: Joi.object({
    text: Joi.string().min(1).max(1000).required(),
  }),
};