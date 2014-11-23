# netiam

REST API library

## Samples

```js
// gets a collection
app
    .get( '/resource' )
    .rest( req )
    .acl( res )
    .json( res );

// gets a resource
app
    .get( '/resource/:id' )
    .rest( req )
    .acl( res )
    .json( res );

// creates a resource
app
    .put( '/resource/:id' )
    .acl( req )
    .rest( {…} )
    .acl( res )
    .json( res );

// updates a resource
app
    .put( '/resource/:id' )
    .acl( req )
    .rest( {…} )
    .acl( res )
    .json( res );

// deletes a resource
app
    .delete( '/resource/:id' )
    .acl( req )
    .rest( {…} )
    .send( res );
```