import passport from 'passport'
import * as error from '../rest/error'

export default function login(opts) {
  opts = Object.assign({
    session: false,
    strategy: ['bearer', 'local', 'basic']
  }, opts)

  return function(req, res) {
    return new Promise((resolve, reject) => {
      passport.authenticate(
        opts.strategy,
        {session: opts.session},
        function(err, user) {
          if (err) {
            return reject(error.internalServerError(err.message))
          }
          if (!user) {
            return reject(error.notFound('User not found'))
          }

          res.body = user
          req.user = user

          resolve()
        })(req, res)
    })
  }
}
