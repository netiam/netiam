# Resources

This section covers resource naming patterns and anti-patterns and how this
library can be used for those use cases.

The theoretical background for the resource implementation of this library
can be found within this wonderful guide
[REST API Tutorial](http://www.restapitutorial.com/resources.html).

## Pluralization

see [REST API Tutorial: Pluralization](https://github.com/tfredrich/RestApiTutorial.com/raw/master/media/RESTful%20Best%20Practices-v1_2.pdf).

## Relationships

### Basic

This is the default case for probably most of the endpoints you will create.
You just can use the *rest* plugin straightforward.

```js
netiam
   .get('/users/:id')
   .rest({collection: User})
   .json();
```

### Resource with custom idField

```js
netiam
  .get('/users/:user')
  .rest({
    idField: 'user',
    collection: User
  })
  .json();
```

### One-To-Many

This is a common case, where a user document stores a list of one or more
project ID's.

**An example model:**

```js
{
  "id": "abc123",
  "name": "anonymous",
  "projects": ["id1", "id2"]
}
```

**A list route:**

```js
netiam
  .get('/users/:user/projects')
  .rest({
    idParam: 'user'
    collection: User,
    relationship: hasMany(Project, {field: 'projects'})
  })
  .json();
```

Be careful on how parameters are assigned to such a relationship. As the
primary resource is the `user` document, the parameter used to identify a
single project has to be defined within the relationship (except you are
using the default `id` parameter).

```js
netiam
  .get('/users/:user/projects/:project')
  .rest({
    idParam: 'user'
    collection: User,
    relationship: hasMany(Project, {field: 'projects', param: 'project'})
  })
  .json();
```

**With defaults:**

```js
netiam
  .get('/users/:user/projects/:id')
  .rest({
    idParam: 'user'
    collection: User,
    relationship: hasMany(Project, {field: 'projects'})
  })
  .json();
```

### Many-To-One

From a users perspective, there is no difference between a *One-To-Many* or
a *Many-To-One* relationship. But for the API developer, a lot of things
are different. The most important part, is the way you are modelling your
data.

**The User model:**

```js
{
  "id": "user123",
  "name": "myuser"
}
```

**The Project model:**

```
{
  "id": "project123",
  "name": "myproject",
  "owner": "user123"
}
```

**A list route:**

The assignment of parameters is a bit different to *One-To-Many*. As the
primary collection is now *Project*, the default *idParam* can be used to
fetch a specific project. The *param* option is set to match the main
resource.

```js
netiam
  .get('/users/:user/projects')
  .rest({
    collection: Project,
    relationship: belongsTo(User, {field: 'owner', param: 'user'})
  })
  .json();
```

For sure it is possible to customize the project parameter too.

```js
netiam
  .get('/users/:user/projects/:project')
  .rest({
    idField: 'project',
    collection: Project,
    relationship: belongsTo(User, {field: 'owner', param: 'user'})
  })
  .json();
```
