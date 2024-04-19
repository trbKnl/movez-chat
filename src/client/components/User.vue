<template>
    <div class="status">
      <status-icon :connected="connected" />{{ status }}
    </div>
</template>

<script>
import StatusIcon from "./StatusIcon.vue";

export default {
  name: "User",
  components: { StatusIcon },
  props: {
    connected: Boolean,
  },
  methods: {
  },
  computed: {
    status() {
      return this.connected ? "online" : "offline";
    },
  },
};
</script>

<style scoped>

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
