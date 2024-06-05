<template>
  <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
    <div class="absolute w-full h-full bg-gray-800 opacity-50"></div> 
    <div class="z-50">
      <div class="bg-white p-8 rounded-lg shadow-lg">

        <p class="mb-2">Your role is</p>
        <p class="mb-2">{{ playerRole }}</p>
        <div v-if="playerRole === 'Imposter'">
          Make other believe you {{ likeTopic === 'like' ? "dislike" : "like" }} sports
        </div>
        <div v-else>
          Who is the imposter, and  is lying about their feelings toward sports?
        </div>

			</div>
  </div>
  </div>
</template>

<script>
export default {
	props: [
    "playerColor",
    "playerRole",
    "likeTopic",
	],
}
</script>
