import parser from './parser'
import ast from './ast'
import _ from 'lodash'

// Set correct scope to parser
parser.yy = ast

/**
 * Identifier
 * @param {ast.Expression|ast.Function|ast.Identifier|String|Number|Boolean|null} type
 * @param {*} type.id
 * @returns {*}
 */
let identifier = function(type) {
  if (type instanceof ast.Expression) {
    return expression(type)
  } else if (type instanceof ast.Function) {
    console.warn('Functions are not supported at the moment')
    return true
  } else if (type instanceof ast.Identifier) {
    return type.id
  } else {
    return type
  }
}

/**
 * Handle expression
 * @param {Object} expr
 * @param {String} expr.left
 * @param {String} expr.op
 * @param {String} expr.right
 * @returns {*}
 */
let expression = function(expr) {
  let lft = identifier(expr.left)
  let rgt = identifier(expr.right)
  let e

  switch (expr.operator) {
    // Logical operators
    case 'and':
      return {$and: [lft, rgt]}
    case 'or':
      return {$or: [lft, rgt]}
    case 'not':
      throw 'Operator not implemented'
    case 'eq':
      e = {}
      e[lft] = rgt
      return e
    case 'ne':
      e = {}
      e[lft] = {$ne: rgt}
      return e
    case 'gt':
      e = {}
      e[lft] = {$gt: rgt}
      return e
    case 'ge':
      e = {}
      e[lft] = {$gte: rgt}
      return e
    case 'lt':
      e = {}
      e[lft] = {$lt: rgt}
      return e
    case 'le':
      e = {}
      e[lft] = {$lte: rgt}
      return e
    // Search operators
    case 'lk':
      e = {}
      e[lft] = new RegExp(rgt, 'i')
      return e
  }
}

/**
 * Filter
 * @param {String} [query]
 * @constructor
 */
class Filter {
  constructor(query = '') {
    this.q = query
  }

  /**
   * Get expression
   * @returns {Object}
   */
  toObject() {
    if (!this.q) {
      return {}
    }

    return expression(parser.parse(this.q))
  }

  /**
   * Logical expressions
   * @param q
   * @param op
   * @return Filter
   */
  logical(q, op) {
    if (!this.q) {
      this.q = q
      return this
    }

    this.q = this.q + ' ' + op + ' '

    return this
  }

  /**
   * Add one or more conditions
   * @param {String|Object} q
   * @returns {Filter}
   */
  where(q) {
    // If no expression available, just apply hash
    if (!this.q && _.isString(q)) {
      this.q = q
      return this
    }

    // Apply AND operation for each key/value pair
    if (_.isObject(q)) {
      let ext = ''
      _.forEach(q, function(val, key) {
        ext += key + ' EQ \'' + val + '\''
      })
      if (!this.q && ext) {
        this.q = ext
      } else {
        this.q += ' AND ' + ext
      }
    }

    return this
  }

  /**
   * Op: and
   * @param q
   * @return Filter
   */
  and(q) {
    return this.logical(q, 'and')
  }

  /**
   * Op: or
   * @param q
   * @return Filter
   */
  or(q) {
    return this.logical(q, 'or')
  }

  /**
   * Op: eq
   * @param q
   * @return Filter
   */
  eq(q) {
    return this.logical(q, 'eq')
  }

  /**
   * Op: ne
   * @param q
   * @return Filter
   */
  ne(q) {
    return this.logical(q, 'ne')
  }

  /**
   * Op: gt
   * @param q
   * @return Filter
   */
  gt(q) {
    return this.logical(q, 'gt')
  }

  /**
   * Op: ge
   * @param q
   * @return Filter
   */
  ge(q) {
    return this.logical(q, 'ge')
  }

  /**
   * Op: lt
   * @param q
   * @return Filter
   */
  lt(q) {
    return this.logical(q, 'lt')
  }

  /**
   * Op: le
   * @param q
   * @return Filter
   */
  le(q) {
    return this.logical(q, 'le')
  }
}

export default function(query) {

  // if empty string, return early
  if (query.length === 0) {
    return new Filter()
  }

  // expressions
  return new Filter(query)
}
