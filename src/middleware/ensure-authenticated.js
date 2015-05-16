export default function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next()
  }

  next(new Error('Not authenticated'))
}
