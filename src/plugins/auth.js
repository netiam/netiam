import passport from 'passport'
import LocalStrategy from 'passport-local'
import {
  BasicStrategy,
  DigestStrategy
  } from 'passport-http'
import BearerStrategy from 'passport-http-bearer'

export default function auth(opts) {
  const {collection} = opts
  const {spec} = {}
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

        done(null, isMatch)
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
  passport.use(new BearerStrategy(spec, handle))
}
