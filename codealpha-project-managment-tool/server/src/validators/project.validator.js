const Joi = require('joi');
module.exports = {
  createProjectSchema: Joi.object({
    name: Joi.string().min(2).max(150).required(),
    description: Joi.string().max(500).allow('').optional(),
    color: Joi.string().max(20).optional(),
  }),
};