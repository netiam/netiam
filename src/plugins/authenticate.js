import _ from 'lodash'
import passport from 'passport'
import LocalStrategy from 'passport-local'
import {BasicStrategy, DigestStrategy} from 'passport-http'
import BearerStrategy from 'passport-http-bearer'

export default function authenticate(opts) {
  /**
   * Handle
   * @param {String} username
   * @param {String} password
   * @param {Function} done
   */
  function handle(username, password, done) {
    let credential = {}
    credential[opts.usernameField] = username

    opts.model.findOne(credential, function(err, user) {
      if (err) {
        return done(err)
      }

      if (!user) {
        return done(null, false, {message: 'Incorrect user'})
      }
      // TODO implement password check
      if (password === password) {
        return done(null, user)
      }
    })
  }

  opts = _.extend(opts, {
    usernameField: 'email',
    passwordField: 'password'
  })

  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })
  passport.deserializeUser(function(id, done) {
    opts.model.findById(id, function(err, user) {
      done(err, user)
    })
  })

  passport.use(new BasicStrategy(opts, handle))
  passport.use(new DigestStrategy(opts, handle))
  passport.use(new LocalStrategy(opts, handle))
  passport.use(new BearerStrategy(opts, handle))
}
