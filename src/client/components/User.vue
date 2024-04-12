<template>
  <div class="user rounded-lg bg-gray-100">
    <div class="description">
      <div class="name">
        {{ user.username }}
      </div>
      <div class="status">
        <status-icon :connected="user.connected" />{{ status }}
      </div>
    </div>
  </div>
</template>

<script>
import StatusIcon from "./StatusIcon.vue";

export default {
  name: "User",
  components: { StatusIcon },
  props: {
    user: Object,
    selected: Boolean,
  },
  methods: {
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
