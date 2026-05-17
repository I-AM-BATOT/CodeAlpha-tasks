const { error } = require('../utils/response');

module.exports = (schema) => (req, res, next) => {
  const { error: err } = schema.validate(req.body, { abortEarly: false });
  if (err) return error(res, err.details.map(d => d.message).join(', '), 422);
  next();
};