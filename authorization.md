Authorization
-------------

Given a certain authorization level, a user is allowed different actions (of the CRUD model)
Note: an emphasis (ie. _U_) indicates that a user is allowed to apply that action only to entries that belong to that user (ie. Update).

| Auth Level |  Albums | Artists | Plays | Playlists | Programs | Users |
|------------|:-------:|:-------:|:-----:|:---------:|:--------:|:-----:|
|  None      |    x    |    x    |   x   |     R     |     R    |   x   |
|  Trainee   |    RU   |    RU   |   R   |     R     |     R    | R _U_ |
|  User      |   CRU   |   CRU   |_CRUD_ |   _CRUD_  |    R _U_ | R _U_ |
|  Exec      |   CRU   |   CRU   | CRUD  |    CRUD   |    CRU   | CR_U_ |
|  Admin     |   CRUD  |   CRUD  | CRUD  |    CRUD   |   CRUD   | CRUD  |


