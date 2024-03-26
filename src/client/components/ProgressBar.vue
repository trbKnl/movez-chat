<template>
    <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div class="bg-blue-600 h-2.5 rounded-full" :style="{ width: value + '%' }"></div>
    </div>
</template>


<script>
export default {
  name: "ProgressBa",
  props: {
    value: {
      type: Number,
      required: true,
      validator: (value) => value >= 0 && value <= 100,
    },
  }
};
</script>

