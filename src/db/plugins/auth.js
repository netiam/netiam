import bcrypt from 'bcrypt'
import dbg from 'debug'

const debug = dbg('netiam:rest:schema:plugins')
const SALT_WORK_FACTOR = 10

export default function auth(collection, opts = {}) {
  const {passwordField} = Object.assign({
    passwordField: 'password'
  }, opts)

  function save(values, next) {
    if (!values.hasOwnProperty(passwordField)) {
      return next()
    }

    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
      if (err) {
        debug(err)
        return next(err)
      }

      bcrypt.hash(values[passwordField], salt, (err, hash) => {
        if (err) {
          debug(err)
          return next(err)
        }

        values[passwordField] = hash
        next()
      })
    })
  }

  this.before('create', save)
  this.before('update', save)

  collection.comparePassword = function(candidate) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(candidate, this[passwordField], (err, isMatch) => {
        if (err) {
          debug(err)
          return reject(err)
        }
        return resolve(isMatch)
      })
    })
  }
}
