import passport from 'passport'
import LocalStrategy from 'passport-local'
import {
  BasicStrategy,
  DigestStrategy
} from 'passport-http'
import BearerStrategy from 'passport-http-bearer'
import * as oauth from '../rest/schema/oauth/token'
import Token from '../rest/models/token'

export default function(opts) {
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
    const query = {[usernameField]: username}

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

  /**
   * Handle bearer token requests
   * @param {String} token
   * @param {Function} done
   */
  function handleBearer(token, done) {
    Token
      .findOne({
        token_type: oauth.TOKEN_TYPE_ACCESS,
        token: token
      })
      .populate('owner')
      .exec(function(err, document) {
        if (err) {
          return done(err)
        }

        if(!document) {
          return done(new Error('User not found'))
        }

        done(null, document.owner)
      })
  }

  passport.serializeUser(function(user, done) {
    done(null, user._id)
  })
  passport.deserializeUser(function(id, done) {
    collection.findById(id, function(err, user) {
      done(err, user)
    })
  })
  passport.use(new BasicStrategy(spec, handle))
  passport.use(new BearerStrategy(spec, handleBearer))
  passport.use(new DigestStrategy(spec, handle))
  passport.use(new LocalStrategy(spec, handle))

  return function(req, res) {
    return new Promise((resolve, reject) => {
      passport.authenticate([
          'basic',
          'bearer',
          'digest',
          'local'
        ],
        {session: false},
        function(err, user) {
          if (err) {
            return reject(err)
          }

          if (!user) {
            return resolve()
          }

          req.login(user, function(err) {
            if (err) {
              return reject(err)
            }

            resolve()
          })
        })(req, res)
    })
  }

}
