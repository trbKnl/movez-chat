<template>
  <div id="app">

    <div v-if="showWelcomeScreen">
      <Welcome @start-chat="startChat"/>
    </div>

    <div v-else>
      <chat />
    </div>

  </div>
</template>

<script>
import Chat from "./components/Chat.vue";
import Welcome from "./components/Welcome.vue";
import socket from "./socket";

export default {
  name: "App",
  components: {
    Chat,
    Welcome,
  },
  data() {
    return {
      showWelcomeScreen: true,
    };
  },
  methods: {
    startChat() {
      const sessionId = window.location.pathname.split('/').pop();
      socket.auth = { sessionId };
      socket.connect();

      this.showWelcomeScreen = false
      localStorage.setItem("WelcomeScreenSeen", "true")
    }
  },

  created() {
    const hasSeenWelsomeScreen = localStorage.getItem("WelcomeScreenSeen");
    if (hasSeenWelsomeScreen === "true") {
      this.startChat()
    }

    socket.on("session", ({ sessionId, userId }) => {
      socket.auth = { sessionId };
      socket.userId = userId;
    })
  }
}
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
