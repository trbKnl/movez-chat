<template>
  <div class="flex flex-row ">
    <ThumbIcon 
      class="w-16 h-16 cursor-pointer hover:bg-gray-200 rounded-lg"
      :class="{ 'fill-sky-500': showThumbUp }"
      @click="clickUp"
    />
    <ThumbIcon 
      class="w-16 h-16 cursor-pointer hover:bg-gray-200 rounded-lg rotate-180"
      :class="{ 'fill-sky-500': showThumbDown }"
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

