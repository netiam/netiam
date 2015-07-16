import bcrypt from 'bcrypt'
import dbg from 'debug'

const debug = dbg('netiam:rest:schema:plugins')

export default function created(schema, opts = {}) {
  const SALT_WORK_FACTOR = 10
  let {passwordField} = opts

  passwordField = passwordField || 'password'

  schema.pre('save', function(next) {
    var self = this

    if (!self.isModified(passwordField)) {
      return next()
    }

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) {
        debug(err)
        return next(err)
      }

      bcrypt.hash(self[passwordField], salt, function(err, hash) {
        if (err) {
          debug(err)
          return next(err)
        }

        self.password = hash
        next()
      })
    })
  })

  schema.methods.comparePassword = function(candidate, cb) {
    bcrypt.compare(candidate, this[passwordField], function(err, isMatch) {
      if (err) {
        debug(err)
        return cb(err)
      }

      cb(null, isMatch)
    })
  }

}
