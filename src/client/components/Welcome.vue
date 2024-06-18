<template>
	<div
		class="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50"
	>
		<div class="absolute w-full h-full bg-white"></div>
		<div class="z-50 text-center w-[1500px]">
			<div class="bg-white p-8 max-w-screen-2xl">
				<h1 class="text-6xl text-movez-purple mt-3">Between Us</h1>

				<p class="text-4xl mt-5">Welcome to our chat game!</p>

				<p class="mt-5 text-xl">
					Today you will talk about sports. You are in a team of 4 people,
					<br />
					composed of one impostor and three investigators.
				</p>

				<p class="mt-5 text-xl">
					The goal of the investigator is to guess the impostor - the player
					<br />
					lying about what their view towards sports.
				</p>

				<p class="mt-5 text-xl">
					The goal of the impostor is to convince they are telling the truth,
					ex. <br />
					convince the rest that they like sports while in reality they don't.
					<br />
					You wanna be impostor? You can state your preference in the game.
				</p>

				<p class="mt-5 text-xl">
					Every player is randomly assigned an avatar and a color. <br />
					You will chat with each other in pairs of two. <br />
					After this, you will be part of a group chat where <br />
					the whole team can talk in the same time, trying to guess that
					impostor.
				</p>
				<p class="text-xl mt-4">All clear? Start the game now!</p>
				<button
					class="bg-movez-purple text-white font-bold py-1.5 text-[17px] px-10 rounded mt-10"
					@click="$emit('startChat')"
				>
					Continue
				</button>
				<div class="flex items-center justify-between">
					<img
						class="w-30 h-24"
						src="../../../public/images/Logo_Erasmus.svg"
						alt="erasmus-logo"
					/>

					<img
						src="../../../public/images/movez_secondary-logo.svg"
						alt="movez-logo"
						class="w-30 h-24"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	emits: ["startChat"],
};
</script>

<style scoped>
@font-face {
	font-family: Fieldwork-Bold;
	src: url("/public/fonts/Fieldwork16GeoBold.otf");
}
h1 {
	font-family: Fieldwork-Bold, Arial, Helvetica, sans-serif;
}
</style>
