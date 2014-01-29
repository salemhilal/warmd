API Spec
--------

Because we're cool and so are API's.

### ```/users```

No use case for querying all users, and no use case for deleting a single
user, so these endponts shouldn't be implemented.

 - ```GET  /users/:id``` - Gets info about user [:id]
 - ```PUT  /users/:id``` - Update user [:id]
 - ```POST /users```     - Create new user, returns userId

### ```/reviews```

 - ```GET  / reviews/:id``` - 


### ```/schedule```

 - ```GET /schedule```      - Returns schedule as html
 - ```GET /schedule.json``` - Returns schedule as machine-parsable data

