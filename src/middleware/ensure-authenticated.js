import * as error from '../rest/error'

export default function(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next()
  }

  next(error.unauthorized('Please login first'))
}
