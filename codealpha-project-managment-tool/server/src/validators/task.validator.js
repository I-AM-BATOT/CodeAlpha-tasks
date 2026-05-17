const Joi = require('joi');
module.exports = {
  createTaskSchema: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(2000).allow('').optional(),
    priority: Joi.string().valid('critical','high','medium','low').optional(),
    dueDate: Joi.string().allow(null,'').optional(),
    labels: Joi.array().items(Joi.string()).optional(),
    boardId: Joi.number().required(),
    projectId: Joi.number().required(),
    assignees: Joi.array().items(Joi.number()).optional(),
  }),
  updateTaskSchema: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().max(2000).allow('').optional(),
    priority: Joi.string().valid('critical','high','medium','low').optional(),
    dueDate: Joi.string().allow(null,'').optional(),
    labels: Joi.array().items(Joi.string()).optional(),
    boardId: Joi.number().optional(),
    assignees: Joi.array().items(Joi.number()).optional(),
  }),
};