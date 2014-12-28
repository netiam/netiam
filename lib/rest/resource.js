'use strict';

var _         = require( 'lodash' ),
    Q         = require( 'q' ),
    RESTError = require( './error' ),
    ACL       = require( './acl' ),
    roles     = require( './roles' ),
    filter    = require( './odata/filter' );

/**
 * Resource
 * @param {Model} model A mongoose model
 * @param {Options} options
 * @constructor
 */
function Resource( model, options ) {
    // Resource properties
    this.model = model;
    this.options = _.merge( {
        idAttribute: '_id'
    }, options || {} );

    // ACL plugin
    this._acl = undefined;
}

/**
 * Normalize the request query. The resource routes do access certain query
 * parameters, neither they are set or not.
 * @param {Object} query The original query object
 * @param {Object} options The resource options
 * @returns {Object} The normalized query object
 * @private
 */
Resource.prototype._normalize = function( query, options ) {
    // Clone query object
    query = _.clone( query );

    // Filter
    if (!query.filter) {
        query.filter = '';
    }

    // Property expansion
    if (query.expand) {
        query.expand = query.expand.split( ',' );
    } else {
        query.expand = [];
    }

    // Order
    if (!query.sort) {
        query.sort = options.idAttribute;
    }

    // Pagination
    if (!query.offset) {
        query.offset = 0;
    } else {
        query.offset = Number( query.offset );
    }
    if (!query.limit) {
        query.limit = 10;
    } else {
        query.limit = Number( query.limit );
    }

    return query;
};

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
Resource.prototype._params = function( params, map ) {
    // Clone map
    map = _.clone( map );

    return _.forOwn( _.clone( map ), function( val, key, obj ) {
        // Handle route params
        if (val.charAt( 0 ) === ':') {
            obj[key] = params[val.substring( 1 )];
            return;
        }

        // Static value
        obj[key] = val;
    } );
};

/**
 * The ACL resource plugin. You can define an ACL (Access Control List) for
 * each resource which handles permissions to documents and its properties.
 * The ACL file must be a valid JSON document.
 *
 * @param {Object} acl A parsed JSON file/string
 * @returns {Resource}
 */
Resource.prototype.acl = function( acl ) {
    this._acl = new ACL( acl );

    return this;
};

/**
 * The owner extension for ACL's allows the plugin to track down
 * ownerships of documents. A resource might have a property "user" or "owner".
 * If the owner property is set, and there is a match for the user who requested
 * the document(s), the apply routine of the ACL plugin will promote any user
 * role with OWNER rights.
 *
 * @param {String} property A property name
 * @returns {Resource}
 */
Resource.prototype.owner = function( property ) {
    this._aclOwner = property;

    return this;
};

/**
 * Apply ACL's to a single document or a list of documents.
 * This method can be used for incoming and outgoing data.
 *
 * @param {Array<Document>|Document} documents
 * @param {User} user User to apply ACL's for
 * @param {String} [privilege] Privilege that need to be checked, default is
 *     "R" -> READ
 * @returns {Array<Document>|Document|Object}
 * @private
 */
Resource.prototype._aclApply = function( documents, user, privilege ) {
    var role,
        that,
        keys,
        keys2,
        isOwner;

    if (!this._acl) {
        return documents;
    }

    privilege = privilege || 'R';
    that = this;

    // Get user role
    if (user) {
        // Handle role cases
        role = roles.get( user.role );
    }
    // No user object, so a GUEST is assumed
    else {
        // Guest
        role = roles.get( 'GUEST' );
    }

    // No role, no data
    if (!role && user) {
        console.warn( 'User has no role: ' + user._id );
        return {};
    }
    if (!role && !user) {
        console.warn( 'No user and no role, GUEST role not found!' );
        return {};
    }

    // No ACL, no data
    if (!this._acl) {
        console.warn( 'ACL\'s are not defined' );
        return {};
    }

    // Check ACL's
    // TODO Check populated paths too
    if (this._acl && role) {
        // Get allowed keys
        keys = this._acl.allowed( role, privilege );

        // Pick allowed keys for a list of documents
        if (_.isArray( documents )) {
            return _.map( documents, function( document ) {
                // User?
                if (user && that._aclOwner && document[that._aclOwner]) {
                    isOwner = document[that._aclOwner].toString() === user._id.toString();
                } else {
                    isOwner = false;
                }

                // Do we need to check for ownership?
                if (that._aclOwner && document[that._aclOwner] && isOwner) {
                    keys2 = that._acl.roleAllowed( keys, roles.get( 'OWNER' ).name, privilege );
                } else {
                    keys2 = keys;
                }

                // Pick allowed keys from document
                return _.pick( document, keys2 );
            } );
        }

        // Pick allowed keys from document
        if (user && that._aclOwner && documents[that._aclOwner]) {
            isOwner = documents[that._aclOwner].toString() === user._id.toString();
        } else {
            isOwner = false;
        }

        if (this._aclOwner && documents[this._aclOwner] && isOwner) {
            keys2 = this._acl.roleAllowed( keys, roles.get( 'OWNER' ).name, privilege );
        } else {
            keys2 = keys;
        }

        return _.pick( documents, keys2 );
    }

    // Return documents with ACL's applied
    return documents;
};

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
 * @param {Object} res The expressjs response object
 * @param {Function} [cb] A callback method invoked after execution
 * @returns {Promise}
 */
Resource.prototype.list = function( req, res, cb ) {
    var q,
        f,
        that,
        query,
        deferred;

    that = this;
    deferred = Q.defer();

    // Normalize
    query = this._normalize( req.query, this.options );

    // Filter
    f = filter( query.filter ).where( this._params( req.params, this.options.map ) );

    // Build query
    q = this.model.find( f.toObject() );

    // Populate
    _.each( query.expand, function( field ) {
        q = q.populate( field );
    } );

    // Sort
    q = q.sort( query.sort );

    // Pagination
    q = q.skip( query.offset );
    if (query.limit && query.limit !== -1) {
        q = q.limit( query.limit );
    }

    // Execute query
    q.exec( function( err, documents ) {
        if (err) {
            return deferred.reject( new RESTError( err, 500 ) );
        }

        if (!_.isArray( documents )) {
            return deferred.resolve( [] );
        }

        deferred.resolve( that._aclApply( documents, req.user, 'R' ) );
    } );

    return deferred.promise.nodeify( cb );
};

/**
 * Fetches a single document from database.
 *
 * @param {Object} req The expressjs request object
 * @param {Object} res The expressjs response object
 * @param {Function} [cb] A callback method invoked after execution
 * @returns {Promise}
 */
Resource.prototype.read = function( req, res, cb ) {
    var q,
        qo,
        that,
        query,
        deferred;

    qo = {};
    that = this;
    deferred = Q.defer();

    // Normalize
    query = this._normalize( req.query, this.options );

    // Query Options
    qo[this.options.idAttribute] = req.params.id;

    // Build query
    q = this.model.findOne( qo );

    // Populate
    _.each( query.expand, function( field ) {
        q = q.populate( field );
    } );

    // Execute query
    q.exec( function( err, document ) {
        if (err) {
            return deferred.reject( new RESTError( err, 500 ) );
        }
        if (!document) {
            return deferred.reject( new RESTError( 'Document not found', 404 ) );
        }

        deferred.resolve( that._aclApply( document, req.user, 'R' ) );
    } );

    return deferred.promise.nodeify( cb );
};

/**
 * Creates a new document and save it to the database.
 *
 * @param {Object} req The expressjs request object
 * @param {Object} res The expressjs response object
 * @param {Function} [cb] A callback method invoked after execution
 * @returns {Promise}
 */
Resource.prototype.create = function( req, res, cb ) {
    var deferred,
        query,
        that;

    that = this;
    deferred = Q.defer();

    // Normalize
    query = this._normalize( req.query, this.options );

    // Create model
    this.model.create( req.body, function( err, documents ) {
        if (err) {
            return deferred.reject( new RESTError( err, 500 ) );
        }
        if (!documents) {
            return deferred.reject( new RESTError( 'Document not found', 404 ) );
        }

        // Populate
        if (query.expand.length > 0) {
            documents.populate( query.expand.join( ' ' ), function() {
                deferred.resolve( that._aclApply( documents, req.user, 'R' ) );
            } );
        } else {
            deferred.resolve( that._aclApply( documents, req.user, 'R' ) );
        }
    } );

    return deferred.promise.nodeify( cb );
};

/**
 * Modifies a single and existing document
 *
 * @param {Object} req The expressjs request object
 * @param {Object} res The expressjs response object
 * @param {Function} [cb] A callback method invoked after execution
 * @returns {Promise}
 */
Resource.prototype.update = function( req, res, cb ) {
    var q,
        qo,
        that,
        query,
        deferred;

    that = this;
    qo = {};
    deferred = Q.defer();

    // Normalize
    query = this._normalize( req.query, this.options );

    // Query Options
    qo[this.options.idAttribute] = req.params.id;

    // Build query
    q = this.model.findOne( qo );

    // Execute query
    q.exec( function( err, document ) {
        if (err) {
            return deferred.reject( new RESTError( err, 500 ) );
        }
        if (!document) {
            return deferred.reject( new RESTError( 'Document not found', 404 ) );
        }

        document
            .merge( req.body )
            .save( function( err ) {
                if (err) {
                    return deferred.reject( new RESTError( err, 500 ) );
                }

                // Populate
                if (req.query.expand) {
                    document.populate( query.expand.join( ' ' ), function() {
                        deferred.resolve( that._aclApply( document, req.user, 'R' ) );
                    } );
                } else {
                    deferred.resolve( that._aclApply( document, req.user, 'R' ) );
                }
            } );
    } );

    return deferred.promise.nodeify( cb );
};

/**
 * Deletes an existing document from database
 *
 * @param {Object} req The expressjs request object
 * @param {Object} res The expressjs response object
 * @param {Function} [cb] A callback method invoked after execution
 * @returns {Promise}
 */
Resource.prototype.remove = function( req, res, cb ) {
    var qo,
        deferred;

    qo = {};
    deferred = Q.defer();

    // Query Options
    qo[this.options.idAttribute] = req.params.id;
    this.model.findOneAndRemove( qo, function( err, documents ) {
        if (err) {
            return deferred.reject( new RESTError( err, 500 ) );
        }
        if (!documents) {
            return deferred.reject( new RESTError( 'Document not found', 404 ) );
        }

        deferred.resolve();
    } );

    return deferred.promise.nodeify( cb );
};

// Export
module.exports = function( model, options ) {
    return new Resource( model, options );
};
