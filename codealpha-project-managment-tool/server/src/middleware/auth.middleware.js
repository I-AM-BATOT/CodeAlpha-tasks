const { verifyAccessToken } = require('../utils/jwt');
const { error } = require('../utils/response');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return error(res, 'Unauthorized', 401);
  try {
    req.user = verifyAccessToken(header.split(' ')[1]);
    next();
  } catch {
    return error(res, 'Invalid or expired token', 401);
  }
};