import passport from 'passport'
import LocalStrategy from 'passport-local'
import {
  BasicStrategy,
  DigestStrategy
  } from 'passport-http'
import RESTError from '../rest/error'

export default function auth(opts) {
  const spec = {}
  const {collection} = opts
  let {usernameField} = opts
  let {passwordField} = opts

  usernameField = usernameField || 'email'
  passwordField = passwordField || 'password'

  spec.usernameField = usernameField
  spec.passwordField = passwordField

  /**
   * Handle
   * @param {String} username
   * @param {String} password
   * @param {Function} done
   */
  function handle(username, password, done) {
    const query = {
      [usernameField]: username
    }

    collection.findOne(query, function(err, user) {
      if (err) {
        return done(err)
      }

      if (!user) {
        return done(null, false, {message: 'Incorrect user'})
      }

      user.comparePassword(password, function(err, isMatch) {
        if (err) {
          return done(err)
        }

        if (!isMatch) {
          return done(new Error('Invalid username or password'))
        }

        done(null, user)
      })
    })
  }

  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })
  passport.deserializeUser(function(id, done) {
    collection.findById(id, function(err, user) {
      done(err, user)
    })
  })
  passport.use(new BasicStrategy(spec, handle))
  passport.use(new DigestStrategy(spec, handle))
  passport.use(new LocalStrategy(spec, handle))

  return function(req, res) {
    return new Promise((resolve, reject) => {
      passport.authenticate([
          'local',
          'basic',
          'digest'
        ],
        {session: false},
        function(err, user) {
          if (err) {
            return reject(err)
          }

          if (!user) {
            return reject(new RESTError('Cannot find user', 401, 'Unauthorized'))
          }

          req.logIn(user, function(err) {
            if (err) {
              return reject(err)
            }

            resolve()
          })
        })(req, res)
    })
  }

}
