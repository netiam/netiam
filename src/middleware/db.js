import connection from '../db/connection'

export default function db(config) {
  let isReady = false

  return function initialize(req, res, next) {
    if (isReady) {
      return next()
    }

    // (re-)connect
    connection
      .initialize(config)
      .then(() => {
        isReady = true
        next()
      })
      .catch(err => {
        next(err)
      })
  }
}
