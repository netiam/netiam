import _ from 'lodash'
import Bluebird from 'bluebird'
import RESTError from './error'
import filter from './odata/filter'

/**
 * Resource
 * @param {Object} opts
 * @constructor
 */
class Resource {
  constructor( opts ) {
    if (!opts.model) {
      throw 'Model is undefined'
    } else {
      this.model = opts.model
    }

    this._opts = _.merge( {
      idParam:     'id',
      idAttribute: '_id'
    }, opts || {} )
  }

  /**
   * Normalize the request query. The resource routes do access certain query
   * parameters, neither they are set or not.
   * @param {Object} query The original query object
   * @param {Object} options The resource options
   * @returns {Object} The normalized query object
   * @private
   */
  _normalize( query, options ) {
    // Clone query object
    query = _.clone( query )

    // Filter
    if (!query.filter) {
      query.filter = ''
    }

    // Property expansion
    if (query.expand) {
      query.expand = query.expand.split( ',' )
    } else {
      query.expand = []
    }

    // Order
    if (!query.sort) {
      query.sort = options.idAttribute
    }

    // Pagination
    if (!query.offset) {
      query.offset = 0
    } else {
      query.offset = Number( query.offset )
    }
    if (!query.limit) {
      query.limit = 10
    } else {
      query.limit = Number( query.limit )
    }

    return query
  }

  /**
   * Maps request parameters to a properties hash object which can be
   * used to create a filter expression for database queries. This method
   * is used to constraint requests of subresources.
   *
   * The following example tries to fetch messages from a specific user.
   * In order to reduce the messages within the database, there must be some
   * kind of 1:n relationship between a user and its messages.
   *
   * The mapping allows you to define a dynamic relationship between a parameter
   * and a specific document property. Internal this mapping is used to reduce
   * the resultset of documents by adding a $where statement to the database
   * query.
   *
   * Example:
   * // Request
   * GET /users/:user/messages
   *
   * // Mapping
   * {
   *  'owner': ':user'
   * }
   *
   * @param {Object} params
   * @param {Object} map
   * @returns {Object}
   * @private
   */
  _params( params, map ) {
    // Clone map
    map = _.clone( map )

    return _.forOwn( _.clone( map ), function( val, key, obj ) {
      // Handle route params
      if (val.charAt( 0 ) === ':') {
        obj[key] = params[val.substring( 1 )]
        return
      }

      // Static value
      obj[key] = val
    } )
  }

  /**
   * Fetches database for a list of documents. As all public resource methods,
   * this one provides several predefined parameters someone can use to
   * manipulate the resultset.
   *
   * Example:
   * GET /users?filter=email EQ
   * 'box@mail.tld'&sort=email-&limit=10&offset=1&expand=messages
   *
   * @param {Object} req The expressjs request object
   * @returns {B}
   */
  list( req ) {
    let deferred = Bluebird.pending()

    // Normalize
    let query = this._normalize( req.query, this._opts )

    // Filter
    let f = filter( query.filter ).where( this._params( req.params, this._opts.map ) )

    // Build query
    let q = this.model.find( f.toObject() )

    // Populate
    query.expand.forEach( function( field ) {
      q = q.populate( field )
    } )

    // Sort
    q = q.sort( query.sort )

    // Pagination
    q = q.skip( query.offset )
    if (query.limit && query.limit !== -1) {
      q = q.limit( query.limit )
    }

    // Execute query
    q.exec( function( err, documents ) {
      if (err) {
        return deferred.reject( new RESTError( err, 500 ) )
      }

      if (!_.isArray( documents )) {
        return deferred.resolve( [] )
      }

      deferred.resolve( documents )
    } )

    return deferred.promise
  }

  /**
   * Fetches a single document from database.
   *
   * @param {Object} req The expressjs request object
   * @returns {B}
   */
  read( req ) {
    let qo = {}
    let deferred = Bluebird.pending()

    // Normalize
    let query = this._normalize( req.query, this._opts )

    // Query options
    qo[this._opts.idAttribute] = req.params[this._opts.idParam]

    // Build query
    let q = this.model.findOne( qo )

    // Populate
    query.expand.forEach( function( field ) {
      q = q.populate( field )
    } )

    // Execute query
    q.exec( function( err, document ) {
      if (err) {
        return deferred.reject( new RESTError( err, 500 ) )
      }
      if (!document) {
        return deferred.reject( new RESTError( 'Document not found', 404 ) )
      }

      deferred.resolve( document )
    } )

    return deferred.promise
  }

  /**
   * Creates a new document and save it to the database.
   *
   * @param {Object} req The expressjs request object
   * @returns {B}
   */
  create( req ) {
    let deferred = Bluebird.pending()

    // Normalize
    let query = this._normalize( req.query, this._opts )

    // Create model
    this.model.create( req.body, function( err, documents ) {
      if (err) {
        return deferred.reject( new RESTError( err, 500 ) )
      }
      if (!documents) {
        return deferred.reject( new RESTError( 'Document not found', 404 ) )
      }

      // Populate
      if (query.expand.length > 0) {
        documents.populate( query.expand.join( ' ' ), function() {
          deferred.resolve( documents )
        } )
      } else {
        deferred.resolve( documents )
      }
    } )

    return deferred.promise
  }

  /**
   * Modifies a single and existing document
   *
   * @param {Object} req The expressjs request object
   * @returns {B}
   */
  update( req ) {
    let qo = {}
    let deferred = Bluebird.pending()

    // Normalize
    let query = this._normalize( req.query, this._opts )

    // Query options
    qo[this._opts.idAttribute] = req.params[this._opts.idParam]

    // Build query
    let q = this.model.findOne( qo )

    // Execute query
    q.exec( function( err, document ) {
      if (err) {
        return deferred.reject( new RESTError( err, 500 ) )
      }
      if (!document) {
        return deferred.reject( new RESTError( 'Document not found', 404 ) )
      }

      document
        .merge( req.body )
        .save( function( err ) {
          if (err) {
            return deferred.reject( new RESTError( err, 500 ) )
          }

          // Populate
          if (req.query.expand) {
            document.populate( query.expand.join( ' ' ), function() {
              deferred.resolve( document )
            } )
          } else {
            deferred.resolve( document )
          }
        } )
    } )

    return deferred.promise
  }

  /**
   * Deletes an existing document from database
   *
   * @param {Object} req The expressjs request object
   * @returns {B}
   */
  delete( req ) {
    var qo,
        deferred

    qo = {}
    deferred = Bluebird.pending()

    // Query Options
    qo[this._opts.idAttribute] = req.params[this._opts.idParam]
    this.model.findOneAndRemove( qo, function( err, documents ) {
      if (err) {
        return deferred.reject( new RESTError( err, 500 ) )
      }
      if (!documents) {
        return deferred.reject( new RESTError( 'Document not found', 404 ) )
      }

      deferred.resolve()
    } )

    return deferred.promise
  }
}

export default function( opts ) {
  return new Resource( opts )
}
