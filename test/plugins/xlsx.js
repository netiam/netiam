import fs from 'fs'
import request from 'supertest'
import app from '../utils/app'
import roles from '../../src/rest/roles'
import {
  setup,
  teardown
} from '../utils/db'
import db from '../../src/db'
import userFixture from '../fixtures/user'

export default function() {
  const n = 10

  before(done => {
    setup()
      .then(() => db.collections.role.find({}))
      .then(documents => {
        roles.set(documents)
        done()
      })
      .catch(done)
  })
  after(teardown)

  it(`should create ${n} random users`, done => {
    let cnt = 0

    for (let i = 0; i < n; i += 1) {
      const modifiedUser = Object.assign(
        {},
        userFixture,
        {email: `test${i}@mail.com`}
      )

      request(app)
        .post('/users')
        .send(modifiedUser)
        .set('Accept', 'application/json')
        .expect(201)
        .expect('Content-Type', /json/)
        .end(err => {
          if (err) {
            return done(err)
          }

          cnt += 1

          if (cnt === n) {
            done()
          }
        })
    }
  })

  it(`should get ${n} users - JSON`, done => {
    request(app)
      .get(`/users?limit=${n}`)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        res.body.should.be.an.Array()
        res.body.should.have.length(n)

        done()
      })
  })

  it(`should get ${n} users - XLSX`, done => {
    const testFile = fs.createWriteStream('.tmp/test.xlsx')

    request(app)
      .get(`/users.xlsx?limit=${n}`)
      .set('Accept', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml')
      .expect(200)
      .expect('Content-Type', /application\/octet-stream/)
      .pipe(testFile)

    testFile.on('finish', done)
  })

}
