# Resources

This section covers resource naming patterns and anti-patterns and how this
library can be used for those use cases.

The theoretical background for the resource implementation of this library
can be found within this wonderful guide
[REST API Tutorial](http://www.restapitutorial.com/resources.html).

## Pluralization

see [REST API Tutorial: Pluralization](https://github.com/tfredrich/RestApiTutorial.com/raw/master/media/RESTful%20Best%20Practices-v1_2.pdf).

## Examples

The following example demonstrates one of more common examples. A user resource
which uses the *id* parameter as identifier for a specific document.

### Single resource

```HTTP
GET /users/:id
```

This is also the default case for probably most of the endpoints you will
create. You just can use the *rest* plugin straightforward.

 ```js
 netiam
     .get( '/users/:id' )
     .rest( {model: User} )
     .json();
 ```

### Resource with custom id attribute

```HTTP
GET /users/:user
```

```js
 netiam
     .get( '/users/:id' )
     .rest( {model: User, idAttribute: 'user'} )
     .json();
 ```

### Nested resources

A very common case is that a resource has some relationship to a parent
resource. Think about a booking site where a user is able to book flights.
It is natural, that a user will get a receipe that is just for him and no one
else.

A common pattern for such a scenario might look like this:

```HTTP
GET /users/:user/receipes/:id
```

This route would need some configuration on your site as the library needs to
know something about the relationship between the *receipes* and *users*
resources.

```js
netiam
     .get( '/users/:user/receipes/:id' )
     .rest( {
        model: Receipe,
        idAttribute: 'id',

        parent: 'user',
        parentModel: User,
        parentAttribute: 'user'
      } )
     .json();
```

This config needs some explanation. The first two lines of the config are
looking common but the following three properties are worth a look.

*parent* defines the property the *rest* plugin will check during each
data fetch cycle. The *Receipe* model must have a reference to the *User*
model.

```js
var schema = new Schema( {
    vat: String,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    …

module.exports = mongoose.model( 'Receipe', schema );
```

In order to make things easier for you, you just need to provide the *parent*
properties to the config as long as you keep your naming up with the convention.

* *Model* must be singular, starting with uppercase letter.
* *parentAttribute* must be the same as the *parent* field
