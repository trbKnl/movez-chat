<template>
  <div id="app">

    <div v-if="showWelcomeScreen">
      <Welcome @start-chat="startGame"/>
    </div>

    <div v-else>
      <game />
    </div>

  </div>
</template>

<script>
import Game from "./components/Game.vue";
import Welcome from "./components/Welcome.vue";
import socket from "./socket";

export default {
  name: "App",
  components: {
    Game,
    Welcome,
  },
  data() {
    return {
      showWelcomeScreen: true,
    };
  },
  methods: {
    startGame() {
      const sessionId = window.location.pathname.replace(/\/$/, '').split('/').pop();
      socket.auth = { sessionId };
      socket.connect();

      this.showWelcomeScreen = false
      localStorage.setItem("WelcomeScreenSeen", "true")
    }
  },

  created() {
    const hasSeenWelsomeScreen = localStorage.getItem("WelcomeScreenSeen");
    if (hasSeenWelsomeScreen === "true") {
      this.startGame()
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
	font-family: Fieldwork-Thin;
	src: url("/public/fonts/Fieldwork4GeoThin.otf");
}

#app {
	font-family: Fieldwork-Thin, Arial, Helvetica, sans-serif;
	font-size: 14px;
}
</style>
