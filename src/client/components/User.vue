<template>
  <div class="user rounded-lg" 
       @click="onClick" 
       :class="{'bg-gray-100': selected}"
  >
    <div class="description">
      <div class="name">
        {{ user.username }}
      </div>
      <div class="status">
        <status-icon :connected="user.connected" />{{ status }}
      </div>
    </div>
    <div v-if="user.hasNewMessages" class="new-messages">!</div>
  </div>
</template>

<script>
import StatusIcon from "./StatusIcon.vue";

export default {
  name: "User",
  components: { StatusIcon },
  emits: ["select"],
  props: {
    user: Object,
    selected: Boolean,
  },
  methods: {
    onClick() {
      this.$emit("select");
    },
  },
  computed: {
    status() {
      return this.user.connected ? "online" : "offline";
    },
  },
};
</script>

<style scoped>

 .user {
   padding: 10px;
 }
 
 .description {
   display: inline-block;
 }
 
 .status {
   color: #92959e;
 }
 
 .new-messages {
   color: white;
   background-color: red;
   width: 20px;
   border-radius: 5px;
   text-align: center;
   float: right;
   margin-top: 10px;
 }
</style>
