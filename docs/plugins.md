# Plugins

Everything this library can do is packed into modules. This modules are named
plugins. Plugins are chained together and put onto a route stack. After a route
has been dispatched the stack will be executed (based on plugin priority and
chain order).

## Anatomy

```js
/**
 * Data plugin
 * @param {*} any
 * @returns {Function}
 */
function data( any ) {
    /**
     * @scope {Resource}
     * @param {Object} req
     * @param {Object} res
     */
    return function( req, res ) {
        res.body = body;
    };
}
module.exports = data;
```

## Example

All of the following methods, which are chained to the route, are plugins.

```js
app
    .get( '/resource/:id' )
    .auth(…)
    .rest(…)
    .transform(…)
    .data(…)
    .acl.req(…)
    .json( {…} )
    .catch( function( err ) {…} )
```

## Lifecycle

1. Initialization

    Every plugin is initialized at startup time. Also every plugin must be
    initialized for every route (not only for a specific resource).

2. Dispatch

    Every plugin must implement a dispatch routine which can return any value.
    If your middleware works async, just return a promise.
