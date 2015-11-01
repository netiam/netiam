import fixtures from 'pow-mongoose-fixtures'
import db from '../utils/db.test'
import roles from './roles'

const data = {
  Role: roles
}

export default function(done) {
  fixtures.load(data, db, function(err) {
    done(err)
  })
}
