# Bootstrap

If you are familiar with *express* and/or *mongoose* you know that they do not
have special setup routines (most of the time). For example, *mongoose* will
establish a *connection* to the database and queue your queries until the
connection is ready.

This library is doing the same, except it queues complete requests. Starting
with *v7* of this library, *waterline* is used as persistence abstraction layer.
*Waterline* requires you to load all collections before you can use them.

## Waterline

This example shows a common waterline setup:

```js
const waterline = new Waterline()

waterline.loadCollection(collection)
waterline.initialize(config, (err, ontology) => {
  …
})
```

## Library

With this library, you do things more or less the same, except invoking
`initialize` yourself.

```js
const waterline = new Waterline()

waterline.loadCollection(collection)

api({db: waterline})
  .plugin(…)
```

The library invokes `initialize` once and will fullfill all potential request
promises on a successfull connect. If there a error on connect, the application
will crash.

There are also a set of default collections that are loaded (user management, …)
during this process.
