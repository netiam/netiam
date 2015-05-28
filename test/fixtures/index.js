import fixtures from 'pow-mongoose-fixtures'
import db from '../utils/db.test'

const data = {
  Role: require('./roles')
}

export default function(done) {
  fixtures.load(data, db, function(err) {
    done(err)
  })
}
