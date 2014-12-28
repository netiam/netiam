# Flow
---

This describes the execution flow of the library.

## Execution flow

1. Router

    At first the application needs to route a request to the according resource.
    This is achieved by using a RESTful convention.

    ```js
    netiam
        .get(  '/users/:id' );
    ```

    The example above would create a new *users* resource using the *:id*
    identifier to get a specific user.

2. Authentication

    If you want a user to authenticate itself, you must enforce authentication
    for a specific request.

    ```js
    netiam
        .authenticate( … )
        .get( '/users/:id' );
    ```

    Depending on the authentication configuration, you have to pass OAuth2
    tokens, a valid session cookie or Basic Auth to the request.

3. ACL (Access Control Lists)

    Requests and responses might contain information not suitable for reading,
    writing or deleting. ACLs can take care of this. You are able to define
    rules for fields, roles and privileges and also wildcard configuration is
    available.

    The ACL plugin is a bit different to most other plugins, cause it might
    influence the request and the response object. You still need to put it
    only once into the execution flow.

    The nature of ACLs makes it necessary that you need to authenticate a user
    before you can use the list. As a simplification, you can avoid invoking
    *.authenticate( … )*. All requests and responses will be matched against
    a *GUEST* role than.

    ```js
    netiam
        .authenticate(…)
        .get( '/resource/:id' )
        .acl( {
            model: user,
            def: './models/user.acl.json'
         } );
    ```

    An example JSON file (support for other formats is planned -> YAML, XML)

    ```json
    {
        "*": {
            "ALLOW": {
                "ADMIN": "CRUD"
            }
        },
        "name": {
            "ALLOW": {
                "USER": "RU",
                "GUEST": "RU"
            }
        },
        "description": {
            "ALLOW": {
                "USER": "RU",
                "GUEST": "RU"
            }
        },
        "created": {
            "ALLOW": {
                "OWNER": "R"
            }
        },
        "modified": {
            "ALLOW": {
                "OWNER": "R"
            }
        }
    }
    ```

4. Response

    After all the execution you usually want to return something to the client.
    At the moment only JSON is supported.

    ```js
    netiam
        .get( '/resource/:id' )
        .json( … );
    ```

5. Transform

    The library tries to keep as much tasks from you as possible but it is
    natural that there is always something special.

    ```js
    netiam
        .get( '/resource/:id' )
        .transform( function( resource ) { … } );
    ```
