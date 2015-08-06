import _ from 'lodash'
import async from 'async'
import dbg from 'debug'

const debug = dbg('netiam:plugins:merge')

function extend(document, collection, refField) {
  if (_.isFunction(document.toJSON)) {
    document = document.toJSON()
  }

  return new Promise((resolve, reject) => {
    collection
      .findById(document[refField])
      .lean()
      .exec((err, documentToMerge) => {
        if (err) {
          debug(err)
          return reject(err)
        }

        if (!documentToMerge) {
          return resolve(document)
        }

        const mergedDocument = Object.assign(
          documentToMerge,
          document
        )

        resolve(mergedDocument)
      })
  })
}

function handle(data, collection, refField, expand) {
  return new Promise((resolve, reject) => {
    if (_.isArray(data)) {
      async.map(
        data,
        (document, done) => {
          const subdocs = {}
          let doc

          let p = extend(document, collection, refField)
            .then(function(extendedDocument) {
              doc = extendedDocument
            })

          _.forEach(expand, function(spec, key) {
            p = p.then(() => {
              return handle(document[key], spec.collection, spec.refField)
                .then(function(docs) {
                  subdocs[key] = docs
                })
            })
          })

          p
            .then(() => {
              _.forEach(expand, function(spec, key) {
                doc[key] = subdocs[key]
              })

              done(null, doc)
            })
            .catch((err) => {
              debug(err)
              done(err)
            })
        },
        (err, extendedDocuments) => {
          if (err) {
            debug(err)
            return reject(err)
          }

          resolve(extendedDocuments)
        }
      )
      return
    }

    if (_.isObject(data)) {
      const subdocs = {}
      let doc

      let p = extend(data, collection, refField)
        .then(function(extendedDocument) {
          doc = extendedDocument
        })

      _.forEach(expand, (spec, key) => {
        p = p.then(() => {
          return handle(data[key], spec.collection, spec.refField)
            .then((docs) => {
              subdocs[key] = docs
            })
        })
      })

      p
        .then(() => {
          _.forEach(expand, (spec, key) => {
            doc[key] = subdocs[key]
          })

          resolve(doc)
        })
        .catch((err) => {
          debug(err)
          reject(err)
        })
    }
  })
}

/**
 * This plugin can merge related documents into an existing document
 *
 * @param {Object} spec
 * @returns {Function}
 */
export default function merge(spec) {
  const {collection} = spec
  const {refField} = spec
  let {expand} = spec

  return function(req, res) {
    // property expansion
    if (_.isString(req.query.expand)) {
      var queryExpand = req.query.expand.split(',')
    }
    expand = _.pick(expand, queryExpand)

    return handle(res.body, collection, refField, expand)
      .then(docs => {
        res.body = docs
      })
  }
}
