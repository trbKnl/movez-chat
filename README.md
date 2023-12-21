# Movez Chat

This repository contains a chat application used by the [Movez project](https://www.eur.nl/essb/informatie-voor/onderzoekers/movez-lab/onderzoekers).

## Implementation details

This project contains a chat application that uses Express, Vue.js, Vite and socket.io. This project has been created using [vite-express](https://github.com/szymmis/vite-express).
The client and server are based on this [example](https://socket.io/get-started/private-messaging-part-4/) from socket.io.


## Start the server

```
# start redis cache and session management
docker run --rm -p 6379:6379 redis:7

# start the development server
npm run dev
```

## Join a chatroom with a username

```
http://localhost:3000/chat/my_room/my_username
```

After initial login your session is stored, upon next login the room id and username are loaded from the session
