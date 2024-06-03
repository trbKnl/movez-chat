<template>
	<div
		class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
	>
		<div class="absolute w-full h-full bg-gray-400"></div>
		<div class="z-50 text-center">
			<div class="bg-white">
				<p class="font-bold text-5xl text-movez-purple my-10 py-10">
					Thank you for playing Between Us. :-)
				</p>
				<p class="font-bold text-5xl text-movez-purple">
					Now, please fill in the questionnaire below
				</p>
				<p class="font-bold text-5xl text-movez-purple">
					to complete your first task of the program:
				</p>
				<button class="bg-movez-purple font-bold rounded-lg mt-10">
					Start Survey
				</button>
				<!-- <img
					src="/public/images/movez.png"
					alt="Avatar"
					class="mx-auto mb-2 w-16 h-16"
				/>
				<p class="text-lg font-semibold text-gray-800 mb-2">
					Thank you for participating in our experiment!
				</p>

				<div v-if="!isSubmitted">
					<p class="text-gray-700 mb-4">
						We hope you enjoyed the game. Please share your suggestions with us.
					</p>
					<textarea
						class="p-3 resize-none w-full border rounded-md focus:outline-none focus:border-blue-500 h-30"
						placeholder="Your suggestions..."
					></textarea>
					<button
						class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md m-3"
						@click="submit"
					>
						Submit
					</button>
				</div>

				<div v-else>
					<p class="text-gray-700">Your feedback has been invaluable.</p>
				</div> -->
			</div>
		</div>
	</div>
</template>

<script>
import socket from "../socket";

export default {
	data() {
		return {
			isSubmitted: false,
		};
	},
	methods: {
		submit(suggestion) {
			this.isSubmitted = true;
			socket.emit("suggestion", suggestion);
		},
	},
};
</script>

<style scoped>
button {
	color: white;
	width: 300px;
	font-size: 20px;
	padding: 7px;
}
</style>
