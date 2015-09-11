import _ from 'lodash'
import fs from 'fs'
import request from 'supertest'
import User from './../models/user'
import fixtures from '../fixtures'
import roles from '../../src/rest/roles'
import Role from '../../src/rest/models/role'
import db from './../utils/db.test.js'
import api from '../../src/netiam'

export default function() {

  const userFixture = require('./../fixtures/user.json')
  const app = require('./../utils/app.test.js')()
  const n = 10

  before(done => {
    app.post(
      '/users',
      api()
        .rest({collection: User})
        .json()
    )

    app.get(
      '/users',
      api()
        .rest({collection: User})
        .json()
    )

    app.get(
      '/users.xlsx',
      api()
        .rest({collection: User})
        .xlsx()
    )

    fixtures(err => {
      if (err) {
        return done(err)
      }

      Role.find({}, (err, docs) => {
        if (err) {
          return done(err)
        }

        roles.set(docs)
        done()
      })
    })
  })

  after(done => {
    db.connection.db.dropDatabase(err => {
      if (err) {
        return done(err)
      }
      done()
    })
  })

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
