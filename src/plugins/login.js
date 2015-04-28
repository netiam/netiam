import passport from 'passport'
import RESTError from '../rest/error'

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
            return reject(new RESTError(err.message, 500))
          }
          if (!user) {
            return reject(new RESTError('User not found', 404))
          }

          res.body = user
          req.user = user

          resolve()
        })(req, res)
    })
  }
}
