# netiam

[![Build Status](https://travis-ci.org/netiam/netiam.svg)](https://travis-ci.org/netiam/netiam)
[![Dependencies](https://david-dm.org/netiam/netiam.svg)](https://david-dm.org/netiam/netiam)
[![npm version](https://badge.fury.io/js/netiam.svg)](http://badge.fury.io/js/netiam)

> A pure REST library

This REST API library addresses some issues I had with API designs over the
last years. It does not claim to provide a full featured solution and to be
honest, it might never will. Nevertheless, someone might find this library
useful. It works as *connect* [middleware](https://github.com/senchalabs/connect)
and you should be able to use it with any compatible infrastructure
(e.g. [express](http://expressjs.com/)).

## TOC

* [ACL](./docs/acl.md)
* [Dispatch Flow](./docs/flow.md)
* [Models](./docs/models.md)
* [Plugins](./docs/plugins.md)
* [Resources](./docs/resources.md)

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
* Completely stateless (except cookie based sessions for authentication in browser apps)
* Profiles (e.g. mobile-friendly API responses)

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
*express* dependency as you might want to use this library with any other Node.js
web framework out there.

Also, there are more than valid reasons to use a relational database instead of
a document based database. There are some great solutions out there. Especially
the [ORM](http://en.wikipedia.org/wiki/Object-relational_mapping)
[sequelizejs](http://sequelizejs.com/) library.

## How it works

The core idea of this library is to give you a bunch of plugins,
which should be used to accept, validate, transform request and/or response
objects.

```js
const path = api()
    .rest({…})
    .json()

app.get('/foo', path)
```

### Plugin example

```js
export default function data(data) {
    return function(req, res) {
        res.body = data;
    }
}

```

### Example

```js
app.get(
    '/users',
    api()
        .auth(…)
        .get('/resource/:id')
        .rest(…)
        .transform(…)
        .data(…)
        .acl(…)
        .json({…})
)
```

### Error handling

You do not need to handle common API errors on your own. The library responds
to the client at least with a proper HTTP status code
(e.g. 404 for document not found) automatically.

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
