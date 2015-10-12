import _ from 'lodash'
import passport from 'passport'
import LocalStrategy from 'passport-local'
import {
  BasicStrategy,
  DigestStrategy
} from 'passport-http'
import BearerStrategy from 'passport-http-bearer'
import {
  TOKEN_TYPE_ACCESS
} from '../db/collections/token'
import {
  getCollectionByIdentity
} from '../db'
import dbg from 'debug'
import {
  BadRequest,
  Unauthorized,
  Codes
} from 'netiam-errors'

const debug = dbg('netiam:plugins:auth')

export default function(spec) {
  const collection = getCollectionByIdentity(spec.collection)
  let {idField} = spec
  let {usernameField} = spec
  let {passwordField} = spec

  idField = idField || 'id'
  usernameField = usernameField || 'email'
  passwordField = passwordField || 'password'

  const authConfig = {
    usernameField,
    passwordField
  }

  /**
   * Handle
   * @param {String} username
   * @param {String} password
   * @param {Function} done
   */
  function handle(username, password, done) {
    const query = {[usernameField]: username}
    let user
    collection
      .findOne(query)
      .then(document => {
        user = document
        if (!user) {
          return done(null, false, {message: 'Incorrect user'})
        }
        return user.comparePassword(password)
      })
      .then(isMatch => {
        if (!isMatch) {
          return done(
            new Unauthorized(Codes.E1000, 'Invalid username or password'))
        }
        done(null, user)
      })
      .catch(done)
  }

  /**
   * Handle bearer token requests
   * @param {String} token
   * @param {Function} done
   */
  function handleBearer(token, done) {
    Token
      .findOne({
        token_type: TOKEN_TYPE_ACCESS,
        token: token
      })
      .populate('owner')
      .exec(function(err, document) {
        if (err) {
          debug(err)
          return done(err)
        }

        if (!document) {
          return done(new NotFound(Codes.E1000, 'User does not exist'))
        }

        done(null, document.owner)
      })
  }

  passport.serializeUser(function(user, done) {
    done(null, user[idField])
  })
  passport.deserializeUser(function(id, done) {
    collection
      .findById(id)
      .then(user => {
        done(null, user)
      })
      .catch(done)
  })
  passport.use(new BasicStrategy(authConfig, handle))
  passport.use(new BearerStrategy(authConfig, handleBearer))
  passport.use(new DigestStrategy(authConfig, handle))
  passport.use(new LocalStrategy(authConfig, handle))

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
            debug(err)
            return reject(err)
          }

          if (!user) {
            return resolve()
          }

          req.login(user, function(err) {
            if (err) {
              debug(err)
              return reject(err)
            }

            resolve()
          })
        })(req, res)
    })
  }

}
