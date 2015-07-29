import * as errors from 'netiam-errors'

export default function(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next()
  }

  next(errors.unauthorized('Please login first'))
}
