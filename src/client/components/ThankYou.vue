<template>
	<div
		class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
	>
		<div class="absolute w-full h-full"></div>
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
				
				<button @click="startSurvey"
					class="bg-movez-purple text-white w-[300px] p-[10px] text-xl font-bold rounded-lg mt-10"
				>
					Start Survey
				</button>
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
		startSurvey() {
      		window.open('https://erasmusuniversity.eu.qualtrics.com/jfe/form/SV_a4V5P06Y3fuj7Se', '_blank');
    	},
		submit(suggestion) {
			this.isSubmitted = true;
			socket.emit("suggestion", suggestion);
		},
	},
};
</script>

<style scoped></style>
