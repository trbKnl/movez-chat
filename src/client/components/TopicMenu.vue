<template>
  <div class="relative inline-block" @click="toggleMenu">
    <button type="button" class="inline-flex items-center justify-between px-2 py-1 font-medium text-gray-700 transition-all duration-500 rounded-md focus:outline-none focus:text-brand-900 sm:focus:shadow-outline">
      <span class="flex-shrink-0">{{ label }} </span>
      <svg fill="currentColor" viewBox="0 0 20 20" class="flex-shrink-0 w-5 h-5 ml-1">
        <path :class="{ 'rotate-180': isMenuOpen }" class="transition duration-300 ease-in-out origin-center transform" fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
      </svg>
    </button>
    <transition enter-active-class="transition duration-300 ease-out transform" enter-class="-translate-y-3 scale-95 opacity-0" enter-to-class="translate-y-0 scale-100 opacity-100" leave-active-class="transition duration-150 ease-in transform" leave-class="translate-y-0 opacity-100" leave-to-class="-translate-y-3 opacity-0">
      <div v-show="isMenuOpen" class="absolute pt-2">
        <div class="relative py-1 bg-white border border-gray-200 rounded-md shadow-xl">
          <div class="absolute top-0 w-4 h-4 origin-center transform rotate-45 translate-x-5 -translate-y-2 bg-white border-t border-l border-gray-200 rounded-sm pointer-events-none"></div>
          <div class="relative">

            <a v-for="(option, index) in menuOptions" @click="selectOption(option)" :key="index" href="#" class="block w-full px-4 py-2 font-medium text-gray-700 whitespace-no-wrap hover:bg-gray-100 focus:outline-none hover:text-gray-900 focus:text-gray-900 focus:shadow-outline transition duration-300 ease-in-out">{{ option }}</a>
          </div>
        </div>
      </div>
    </transition>
  </div>

</template>

<script>



export default {
  props: [
    "menuLabel",
    "menuLabelChosen",
    "menuOptions"
  ],
  data() {
    return {
      isMenuOpen: false,
      selectedOption: "",
      label: this.menuLabel,
    };
  },
  emits: ["chosenOption"],
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },

    selectOption(option) {
      this.selectedOption = option
      this.$emit('chosenOption', option)
      this.label = `${this.menuLabelChosen}${this.selectedOption}`
    }
  }
}
</script>

<style scoped>
</style>

