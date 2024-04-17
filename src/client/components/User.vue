<template>
    <div class="status">
      <status-icon :connected="user.connected" />{{ status }}
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
