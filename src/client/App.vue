<template>
  <div id="app">
    <chat />
  </div>
</template>

<script>
import SelectUsername from "./components/SelectUsername.vue";
import Chat from "./components/Chat.vue";
import socket from "./socket";

export default {
  name: "App",
  components: {
    Chat,
    SelectUsername,
  },
  data() {
    return {
      sessionsExists: false,
    };
  },
  created() {
    // Check if session exists in local storage
    const sessionID = localStorage.getItem("sessionID");
    if (sessionID) {
      this.sessionsExists = true;
      socket.auth = { sessionID };
      socket.connect();

    // If a sessions does not exist request one from the server
    } else {
      this.sessionsExists = true;
      //socket.auth = { username };
      socket.connect();
    }

    // Receive sessionID from server and storge in local storage
    socket.on("session", ({ sessionID, userID, room }) => {
      socket.auth = { sessionID };
      localStorage.setItem("sessionID", sessionID);
      socket.userID = userID;
      socket.room = room;
    });

    socket.on("connect_error", (err) => {
      if (err.message === "invalid username") {
        this.sessionsExists = false;
      }
    });
  },
  destroyed() {
    socket.off("connect_error");
  },
};
</script>

<style>
body {
  margin: 0;
}

@font-face {
  font-family: Lato;
  src: "~/public/fonts/Lato-Regular.ttf";
}

#app {
  font-family: Lato, Arial, sans-serif;
  font-size: 14px;
}
</style>
