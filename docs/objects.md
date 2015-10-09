# Objects

## Request

The common `request` object MAY have data within some properties under certain
conditions. *JSON* request payload for these HTTP methods (POST, PUT, PATCH)
should be provided as JSON encoded strings.

### Body

The `req.body` contains a deserialized *JSON* object which can be used to
create or update resources.

## Response

The `response` object follows the structure of the default `request` object.
We just extend the default `resopnse` with some extra properties that are
defined as follows.

### Body

Inspired by standard HTTP response, it contains the response data as
`entity-body. It may be transformed for format reasons or to enrich the
representation with e.g. metadata.

```js
function(req, res) {
  res.body = {hello: 'world'}
}
```

### Meta

It should contain any metadata provided by `plugins`. A common use-case in a
RESTful scenario is as follows:

A `res` plugin does fetch resources from a persistance layer (e.g. database)
and does receive some extra information that might be useful. If you think
about *JSON API*, you may have to create a `links` property on the root level.
In order to create those links, you need some extra information such as the
total amount of documents within the database (for this resource), the current
`page` or the actual `limit` and `offset` values. As some of these values
can always be determined from the `req.query` or `req.params` objects, it is
not true for everything.

```js
function(req, res) {
  return collection
    .count()
    .then(val => {
      res.meta.amount = val
    })
}
```
