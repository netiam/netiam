# Plugins
---

Everything this library can do is packed into modules. This modules are named
plugins. Plugins are chained together and put onto a route stack. After a route
has been dispatched the stack will be executed (based on plugin priority and
chain order).

## Example

All of the following methods, which are chained to the route, are plugins.

```js
app
    .get( '/resource/:id' )
    .authenticate(…)
    .rest(…)
    .transform(…)
    .data(…)
    .acl(…)
    .json( {…} )
    .catch( function( err ) {…} )
```

## Lifecycle

1. Initialization

    Every plugin is initialized at startup time. Also every plugin must be
    initialized for every route (not only for a specific resource).

2. Priority

    A plugin might have a specific priority. Priorities are saved as numeric values
    from 0 to 99. Someone might also use the predefined values *LOW*, *NORMAL* or
    *HIGH*.

    Some plugins (e.g. authenticate) need to run upfront and therefore should have
    the highest priority.

3. Hooks

    A plugin must use a hook in order to transform either a request or response.
    Several hooks are available.

    ```js
    .on( 'route', function(req, res) { … } )
    .on( 'fail', function(req, res) { … } )
    .on( 'done', function(req, res) { … } )
    ```
