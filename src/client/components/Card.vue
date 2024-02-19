<template>
  <div class="container mx-auto hover:cursor-pointer" @click="nextCard">
    <div class="bg-white shadow-lg rounded-lg overflow-hidden m-4">
      <div class="px-4 py-2 md:min-h-64">
        <h2 class="text-gray-800 text-xl font-semibold">Discussion Topic</h2>
        <transition name="slide-fade" mode="out-in">
        <p :key="randomMessage" class="text-gray-600 flex justify-between items-center font-semibold">
          {{ randomMessage }} 
        </p>
        </transition>
      </div>
      <div class="flex items-center justify-between px-4 py-2 bg-gray-900">
        <p class="text-gray-200">Click for the next topic</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "StatusIcon",
  props: {
    connected: Boolean,
  },
};
</script>

<style scoped>
.icon {
  height: 8px;
  width: 8px;
  border-radius: 50%;
  display: inline-block;
  background-color: #e38968;
  margin-right: 6px;
}

.icon.connected {
  background-color: #86bb71;
}
</style>
