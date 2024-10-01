<template>
	<div
		class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
	>
		<div class="absolute w-full h-full"></div>
		<div class="z-50 text-center">
			<div class="bg-white flex flex-col items-center">
				<p class="text-5xl text-movez-purple">
					Thank you for playing Between Us. :-)
				</p>
				<p class="text-5xl text-movez-purple mt-10">
					We have some final questions to complete
				</p>
				<p class="text-5xl text-movez-purple">your first task.</p>
				<p class="survey text-5xl text-movez-purple mt-10">
					Click on "Start Survey". You will need your
				</p>
				<p class="survey text-5xl text-movez-purple">
					unique ID: {{ sessionId }}
				</p>
				<button
					@click="startSurvey"
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
			sessionId: null,
		};
	},
	created() {
		this.sessionId = window.location.pathname
			.replace(/\/$/, "")
			.split("/")
			.pop();
	},
	methods: {
		startSurvey() {
			window.open(
				"https://erasmusuniversity.eu.qualtrics.com/jfe/form/SV_7UKxU1EBczstj0y",
				"_blank"
			);
		},
		submit(suggestion) {
			this.isSubmitted = true;
			socket.emit("suggestion", suggestion);
		},
	},
};
</script>

<style scoped>
@font-face {
	font-family: Fieldwork-Fat;
	src: url("/public/fonts/Fieldwork22GeoFat.otf");
}
.survey {
	font-family: Fieldwork-Fat, sans-serif;
}
</style>
