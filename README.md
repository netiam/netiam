# netiam

[![Build Status](https://travis-ci.org/eliias/netiam.svg)](https://travis-ci.org/eliias/netiam)
[![Dependencies](https://david-dm.org/eliias/netiam.svg)](https://david-dm.org/eliias/netiam)
[![Code Climate](https://codeclimate.com/github/eliias/netiam/badges/gpa.svg)](https://codeclimate.com/github/eliias/netiam)
[![Test Coverage](https://codeclimate.com/github/eliias/netiam/badges/coverage.svg)](https://codeclimate.com/github/eliias/netiam)

> A pure REST library

This REST API library addresses some issues I had with API designs over the
last years. It does not claim to provide a full featured solution and to be
honest, it might never will. Nevertheless, someone might find this library
useful. It works as *connect* [middleware](https://github.com/senchalabs/connect)
and you should be able to use it with any compatible infrastructure
(e.g. [express](http://expressjs.com/)).

## Get it

```bash
npm i -S netiam
```

## Tests

Using [mocha](http://mochajs.org) with [should](http://shouldjs.github.io/) for
tests and [istanbul](https://github.com/gotwarlost/istanbul) to check coverage.

```bash
npm test
```

## What can it do for you

* Authentication (all the sugar is provided by [passportjs](http://passportjs.org/))
* Authorization (with ACLs, inheritance support for roles, assertions and wildcards)
* Query language (effective and powerful filters)
* File Handling (uploads, media extensions, metadata)
* Completely stateless (except cookie based sessions for authentication in browser apps)
* Profiles (e.g. mobile-friendly API responses)
* Arbitrary environments (configs with inheritance support)
* CLI (generate code, scaffolding)
* Documentation generator

## Specification

* [Execution flow](docs/flow.md)
* [Plugin](docs/plugins.md)
* [Resources](docs/resources.md)

## Getting started

Creates a single route, using the *data* plugin to add some data and returns
everything as JSON.

```js
import express from 'express'
import http from 'http'
import api from 'netiam'

const app = express()
const server = http.createServer(app)

app.get(
    '/users'
    api()
        .data({'Hello': 'World!'})
        .json()
)

server.listen(3000)
```

## Tech Stack

* Express
* MongoDB + Mongoose

## Future

Upcoming releases might provide a better abstraction and allows you to choose
your own database, filesystem and so on. There is also a plan to cut loose the
Express dependency as you might want to use this library with any other Node.js
web framework out there.

I personally think GridFS is great, but might not be the perfect solution for
everyone. Also, there are valid reasons to use a relational database instead of
a document based database. There are some great solutions out there. Especially
the [ORM](http://en.wikipedia.org/wiki/Object-relational_mapping)
[sequelizejs](http://sequelizejs.com/) library.

## Today

There is nothing to try for you, cause I am currently figuring out how I should
prepare the work I have done in the past and how I can provide it in a usable way.

## How it works

The core idea of this library is to give you a bunch of plugins,
which should be used to accept, validate, transform request and/or response
objects.

```js
const path = api()
    .rest({…})
    .json();

app.get( '/foo', path );
```

The library is using [Express](http://expressjs.com/) as core infrastructure layer for
routing requests and serving data.

### Plugin example

```js
/**
 * Data plugin
 * @param {Route} route
 * @param {Object} body
 * @returns {Function}
 */
export default function data( route, body ) {
    return function( req, res ) {
        res.body = body;
    };
}

```

### Example

```js
app.get(
    '/users',
    api()
        .authenticate(…)
        .get( '/resource/:id' )
        .rest(…)
        .transform(…)
        .data(…)
        .acl(…)
        .json( {…} )
)
```

### Error handling

You do not need to handle common API errors on your own. The library responds
to the client at leasat with a proper HTTP status code
(e.g. 404 for document not found) automatically.

### Files

The library takes care of different API tasks. Most people want to use this lib
as their core API framework for classic JSON coast-to-coast applications.
Anyway, a lot of APIs need to accomplish more than that.

A good example is how to handle files. This library takes care of file uploads
and delivery with the help of [GridFS](http://docs.mongodb.org/manual/core/gridfs/).

We also provide extensions for common media related file tasks. For this purpose
you can extend your API with media extensions.

#### Get a single file

```bash
app
    .get( '/files/:id' )
    .file( {…} )
```

The library also takes care of file ownerships and privileges. We are using the
[metadata](http://docs.mongodb.org/manual/reference/gridfs/#gridfs-files-collection) property for this.

The file handler is a special case. We do not follow REST principals 100% here.
Someone might expect file metadata instead of the binary representation of the
file when fetching for a specific resource ID. We have chosen to not do so as
we have learned from experience, that this tradeoff should be made.

Though, you still can get the metadata if you want.

```HTTP
GET /files/1/metadata
```

```js
app
    .get( '/files/:id/metadata' )
    .file( {metadata: true} )
```

There is another option you might consider useful. Forcing a download. It simply
adds a Content-Disposition header.

```HTTP
GET /files/1/download
```

```HTTP
Content-Disposition: attachment; filename="downloaded.pdf"
```

```js
app
    .get( '/files/:id/download' )
    .file( {download: true} )
```

You can also set a query parameter that is used to override the filename which
is sent to the client.

```HTTP
GET /files/1?name=filename.pdf
```

```js
app
    .get( '/files/:id' )
    .file(
        {
            download: true,
            filename: 'name'
        }
    )
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
