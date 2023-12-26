<template>
  <div class="chat-container">
    <div class="header">
      <status-icon :connected="user.connected" />
      <div class="username">{{ user.username }}</div>
    </div>

    <div class="content" ref="messagesContainer">
      <ul class="messages">
        <li
          v-for="(message, index) in user.messages"
          :key="index"
          class="message"
          :class="{'message-self': message.fromSelf}"
        >
          <div v-if="displaySender(message, index)" class="sender">
            {{ message.fromSelf ? "You" : user.username }}
          </div>
          <div class="message-content">{{ message.content }}</div>
          <div class="timestamp">{{ formatTimestamp(message.timestamp) }}</div>
        </li>
      </ul>
    </div>

    <form @submit.prevent="onSubmit" class="form">
      <textarea
        v-model="input"
        placeholder="Your message..."
        class="input"
        @keydown="handleKeydown"
      ></textarea>
      <button :disabled="!isValid" class="send-button">
        <i class="fas fa-paper-plane"></i> Send
      </button>
    </form>
  </div>
</template>




<script>
import StatusIcon from "./StatusIcon.vue";

export default {
  name: "MessagePanel",
  emits: ["input"],
  components: {
    StatusIcon,
  },
  props: {
    user: Object,
  },
  data() {
    return {
      input: "",
    };
  },
  methods: {
    onSubmit() {
      if (this.isValid) {
        this.$emit("input", this.input);
        this.input = "";
      }
    },
    handleKeydown(event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        this.onSubmit();
      }
    },
    displaySender(message, index) {
      return (
        index === 0 ||
        this.user.messages[index - 1].fromSelf !== message.fromSelf
      );
    },
    formatTimestamp(timestamp) {
      // Implement timestamp formatting logic here
      return timestamp;
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        container.scrollTop = container.scrollHeight;
      });
    },
  },
  computed: {
    isValid() {
      return this.input.trim().length > 0;
    },
  },
  mounted() {
    this.scrollToBottom();
  },
  updated() {
    this.scrollToBottom();
  },
};
</script>


<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full viewport height */
  background-color: #f8f8f8;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 40px;
  padding: 20px 40px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f5f5f5;
}

.username {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
}

.messages {
  margin: 0;
  padding-bottom: 20px; /* Space at the bottom */
  list-style: none;
}

.message {
  margin-bottom: 10px;
  padding: 10px 15px;
  border-radius: 15px;
  background-color: #3f0e40; /* Message bubble color */
  max-width: 70%;
}

.message-self {
  background-color: #a574a6; /* Self message color */
  margin-left: auto;
}

.sender {
  font-weight: bold;
  margin-bottom: 5px;
}

.message-content {
  word-wrap: break-word;
  color: #333;
}

.timestamp {
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 5px;
}

.form {
  display: flex;
  padding: 20px 40px;
  background-color: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

.input {
  flex-grow: 1;
  resize: none;
  padding: 10px;
  line-height: 1.5;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-right: 10px;
}

.send-button {
  width: 100px;
  background-color: #3f0e40; /* Send button color */
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.send-button:hover {
  background-color: #0056b3; /* Hover color */
}

@media screen and (max-width: 600px) {
  .header, .form {
    padding: 10px;
  }
  .messages {
    padding: 15px;
  }
  .input, .send-button {
    padding: 5px;
  }
}
</style>
