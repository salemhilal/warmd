warmd
=====

WRCT: A Radio Music Database


Overview
--------
The current database system at WRCT is a collection of perl scripts held together by duct tape, shoelaces, and the prayers of tiny children.
We aim to fix that. We're writing the project in Node, because we can't see Javascript going anywhere in the near future.


Installation
------------

To get started developing, do these things

1. Get [node.js](http://nodejs.org/)
2. Clone the repo: ```git clone https://github.com/bichiliad/warmd.git```
3. ```mv config/keys.example.js config/keys.js```, add DB info in ```keys.config```
5. ```npm install``` to install node dependencies
6. ```npm start``` to start the server up with nodemon.

Deployment
----------

Here are the steps to getting everything you need ready to deploy on a fresh production server
(only available in the ```frontend``` branch at the moment):

```bash
# Clone the repo
git clone https://github.com/bichiliad/warmd.git
# Install dependencies
cd warmd && ./scripts/ubuntu_setup.sh
# Populate the keys.js file with mysql login info
mv config/keys.example.js config/keys.js && vi config/keys.js
# Generate a security certificate
cd scripts && gencerts.sh
# Start 'er up
npm run deploy
```

Running
-------

There are a handful of commands defined in the ```package.json```. They're listed below:

1. ```npm start``` or ```npm run start``` - Starts the server in development mode
2. ```npm test``` or ```npm run test``` - Runs the Vows test suite
3. ```npm run deploy``` - Deploys the server using Forever
4. ```npm run halt``` - Halts the server, if deployed. Errors if not.


API
---

Here are the endpoints that the server exposes. Assume that they accept/return JSON.
Most ```GET``` requests are public, and all ```POST/PUT/DELETE``` require some sort of auth.

Some models expose a ```/query``` endpoint for querying a collection of the model.
Unless otherwise specified, queries accept request bodies of the following format (JSON):

```
{
  "query": "shilal", /* Query collection for this string */
  "limit": 10        /* Limit respose to ten responses */
}
```

Below are detailed info about each of the routes, listed by model.

### ```/users```

 * ```GET  /users/:userID``` - Get info for user @userID
 * ```POST /users/query``` - Query for users. Searches by userID and first/last names.

### ```/artists```

 * ```GET  /artits/:artistID``` - Get info for artist @artistID
 * ```POST /artists/query``` - Query for artists. Searches by full name and shortname.

### ```/programs```

 * ```GET  /programs/:programID``` - Get info for program @programID

### ```/playlists```

 * ```GET  /playlists/:playlistID``` - Get info for playlist @playlistID
 * ```POST /playlists``` - Create new playlist
 * ```PUT  /playlists/:playlist``` - Update playlist @playlistID

### ```/plays```

 * ```POST /plays``` - Create a new play
 * ```POST /plays/query``` - Query for plays. Searches by **playlist id** (important!)

Scope
-----
There are a number of functionalities of this db. Specifically:


 * **Users** - We track a lot of users. Station members, staff, DJ's, producers, etc. It's a lot to keep track of. So, this system should do that for us. Names, password hashes, contact info, membership status, and privileges are all important, plus some role-specific things like shows and reviews.

 * **Shows/Programs** - We gotta keep track of the shows. This means start times, end times, playlists,

 * **Playlists** - These are what was played in a show. They are owned by shows and contain plays.
     * PlaylistID - sentinel value
     * StartTime - When did it start?
     * EndTime - When did it end?
     * UserID - Who made the playlist?
     * ProgramID - Is it associated with a show?
     * Comment - Anything special to mention?

 * **Play** - They'd contain a track name and enough information to discern an album and artist (like an album sentinel ID or an album name and artist name). Also needs to know if the play was a bincut at the time of play.

 * **Artists** - Bands, DJ's, Guitarists, etc. They own Albums, may have bio info or a gracenote url.

 * **Albums** - Owned by artists. Have titles, genres, years, etc.

 * **Labels** - Contains information for record labels (contact info, etc).
     * LabelID - Sentinel Values
     * LabelName
     * ContactPerson
     * Email
     * Phone
     * Address
     * Url

 * **Reviews** - Review of an album.
     * ReviewID - sentinel value
     * UserID - User who made the review
     * AlbumID - Album that the review is about
     * ReviewText - Text of the review
     * Timestamp - When the review was added to the DB
