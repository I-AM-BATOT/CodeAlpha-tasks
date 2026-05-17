const success = (res, data = null, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data });

const error = (res, message = 'Server error', status = 500) =>
  res.status(status).json({ success: false, message, data: null });

module.exports = { success, error };