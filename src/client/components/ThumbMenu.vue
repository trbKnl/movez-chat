<template>
  <div class="flex flex-row ">
    <ThumbIcon 
      class="w-16 h-16 cursor-pointer hover:bg-gray-200 rounded-lg mx-5"
      :class="{ 'fill-movez-purple': showThumbUp }"
      @click="clickUp"
    />
    <ThumbIcon 
      class="w-16 h-16 cursor-pointer hover:bg-gray-200 rounded-lg rotate-180"
      :class="{ 'fill-movez-purple': showThumbDown }"
      @click="clickDown"
    />
  </div>
</template>

<script>
import ThumbIcon from './icons/Thumb.vue'

export default {
  data() {
    return {
      isMenuOpen: false,
      buttonLabel: "Choose your topic",
      selectedOption: "",
      showThumbUp: false,
      showThumbDown: false
    };
  },
  components: {
    ThumbIcon
  },
  emits: ["isThumbUp"],
  methods: {
    clickUp() {
      this.showThumbUp = true
      this.showThumbDown = false
      this.$emit('isThumbUp', "like")
    },
    clickDown() {
      this.showThumbUp = false
      this.showThumbDown = true
      this.$emit('isThumbUp', "dislike")
    }
  }
}
</script>
<style scoped>
</style>

