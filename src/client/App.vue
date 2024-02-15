<template>
  <div id="app">
    <chat />
  </div>
</template>

<script>
import Chat from "./components/Chat.vue";
import socket from "./socket";

export default {
  name: "App",
  components: {
    Chat,
  },
  data() {
    return {
      sessionsExists: false,
    };
  },
  created() {
    // Check if session exists in local storage
    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      this.sessionsExists = true;
      socket.auth = { sessionId };
      socket.connect();

    // If a sessions does not exist request one from the server
    } else {
      this.sessionsExists = true;
      //socket.auth = { username };
      socket.connect();
    }

    // Receive sessionId from server and storge in local storage
    socket.on("session", ({ sessionId, userId, roomId }) => {
      socket.auth = { sessionId };
      localStorage.setItem("sessionId", sessionId);
      socket.userId = userId;
      socket.roomId = roomId;
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
