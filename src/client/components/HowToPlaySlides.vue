<template>
	<div
		class="bg-movez-purple px-20 py-10 flex flex-col justify-evenly w-[900px] h-[500px]"
		v-if="slideIndex === 1"
	>
		<div>
			<div class="flex justify-center items-center">
				<img
					class="w-[500px]"
					src="../../../public/images/movez_secondary-logo.svg"
					alt="movez-logo"
				/>
			</div>
		</div>
		<div class="text-white text-lg">
			<p>These slides will guide you on how to play the chat game.</p>
		</div>
	</div>
	<div class="bg-movez-purple px-20 py-10 h-[500px] w-[900px]" v-if="slideIndex === 2">
		<div class="flex justify-between text-white text-5xl">
			<h1>HOW TO PLAY</h1>
			<p>{{ `${slideIndex - 1 } / 5` }}</p>
		</div>
		<div>
			<div class="flex justify-center ml-3 mt-3 relative">
				<div class="mr-3 absolute top-7 left-9">
					<img
						class="w-[120px]"
						src="../../../public/images/slider-images/cloud-messaging.png"
						alt="cloud-one"
					/>
				</div>
				<div class="mr-8 absolute top-8 left-[190px]">
					<img
						class="w-[120px]"
						src="../../../public/images/slider-images/cloud-messaging.png"
						alt="cloud-two"
					/>
				</div>
				<div class="ml-[80px]">
					<img
						class="w-[120px]"
						src="../../../public/images/slider-images/cloud-messaging.png"
						alt="cloud-three"
					/>
				</div>
				<div class="mr-3 absolute top-7 right-[90px]">
					<img
						class="w-[120px]"
						src="../../../public/images/slider-images/cloud-messaging.png"
						alt="cloud-four"
					/>
				</div>
			</div>
			<div class="flex justify-center">
				<div class="mr-2">
					<img
						class="w-[120px]"
						src="../../../public/images/cat.svg"
						alt="cat"
					/>
				</div>
				<div class="ml-3">
					<img
						class="w-[120px]"
						src="../../../public/images/dog.svg"
						alt="dog"
					/>
				</div>
				<div class="ml-3">
					<img
						class="w-[120px]"
						src="../../../public/images/panda.svg"
						alt="panda"
					/>
				</div>
				<div class="ml-5">
					<img
						class="w-[120px]"
						src="../../../public/images/sloth.svg"
						alt="sloth"
					/>
				</div>
			</div>
		</div>
		<div class="text-white text-lg mt-10">
			<p>It's simple!</p>
			<p>You will be paired with three random players in the chatroom.</p>
			<p>But there is one imposter between you...</p>
		</div>
	</div>
	<div class="bg-movez-purple px-20 py-10 h-[500px] w-[900px]" v-if="slideIndex === 3">
		<div class="flex justify-between text-white text-5xl">
			<h1>HOW TO PLAY</h1>
			<p>{{ `${slideIndex - 1 } / 5` }}</p>
		</div>
		<div class="flex justify-evenly mt-12">
			<div class="flex flex-col">
				<div>
					<img
						class="w-[100px]"
						src="../../../public/images/slider-images/soccer.png"
						alt="soccer"
					/>
				</div>
				<div class="mt-5">
					<img
						class="w-[100px]"
						src="../../../public/images/slider-images/drama.png"
						alt="drama"
					/>
				</div>
			</div>
			<div class="w-[1px] h-[200px] bg-white"></div>
			<div class="flex justify-center items-center">
				<img
					class="w-[140px]"
					src="../../../public/images/slider-images/feedback.png"
					alt="feedback"
				/>
			</div>
		</div>
		<div class="text-white text-lg mt-3">
			<p class="mb-5">Before the chat starts...</p>
			<p>1. Let us know whether you like or dislike the chat topic: watching football.</p>
			<p>2. Tell us whether you would like to play as the imposter or not.</p>
		</div>
	</div>
	<div class="bg-movez-purple px-20 py-10 h-[500px] w-[900px]" v-if="slideIndex === 4">
		<div class="flex justify-between text-white text-5xl">
			<h1>HOW TO PLAY</h1>
			<p>{{ `${slideIndex - 1 } / 5` }}</p>
		</div>
		<div class="flex justify-around items-center mt-20">
			<div class="relative">
				<div class="absolute bottom-20 left-7">
					<img
						class="w-[80px]"
						src="../../../public/images/slider-images/drama.png"
						alt="drama"
					/>
				</div>
				<div>
					<img
						class="w-[120px]"
						src="../../../public/images/dog.svg"
						alt="dog"
					/>
				</div>
				<p class="text-white text-[12px] mb-0">IMPOSTER</p>
			</div>
			<div>
				<div class="flex justify-center items-center">
					<div>
						<img
							class="w-[120px]"
							src="../../../public/images/cat.svg"
							alt="cat"
						/>
					</div>
					<div>
						<img
							class="w-[120px]"
							src="../../../public/images/panda.svg"
							alt="panda"
						/>
					</div>
					<div>
						<img
							class="w-[120px]"
							src="../../../public/images/sloth.svg"
							alt="sloth"
						/>
					</div>
				</div>
				<p class="text-white text-[12px]">INVESTIGATORS</p>
			</div>
		</div>
		<div class="text-white text-lg mt-10">
			<div>
				<p>As the imposter convince the others that</p>
				<p>
					you
					<span class="underline">do</span> /
					<span class="underline">do not</span> like football (opposite to your
					actual liking).
				</p>
			</div>
			<div class="mt-3">
				<p>As an investigator you have to ask clever questions</p>
				<p>to find out who the imposter is.</p>
			</div>
		</div>
	</div>
	<div class="bg-movez-purple px-20 py-10 h-[500px] w-[900px]" v-if="slideIndex === 5">
		<div class="flex justify-between text-white text-5xl">
			<h1>HOW TO PLAY</h1>
			<p>{{ `${slideIndex - 1 } / 5` }}</p>
		</div>
		<div class="flex justify-around items-center mt-20">
			<div>
				<img
					class="w-[120px]"
					src="../../../public/images/slider-images/clock.png"
					alt="clock"
				/>
			</div>
			<div class="relative">
				<div class="absolute bottom-[-50px] left-[100px]">
					<img
						class="w-[150px]"
						src="../../../public/images/slider-images/screenshot-one.png"
						alt="screenshot-one"
					/>
				</div>
				<div>
					<img
						class="w-[250px]"
						src="../../../public/images/slider-images/screenshot-two.png"
						alt="screenshot-two"
					/>
				</div>
			</div>
		</div>
		<div class="text-white text-lg mt-20">
			<div>
				<p>First, you chat with each of the 3 other players privately.</p>
				<p>Afterwards, everyone joins the group chat.</p>
			</div>
			<div class="mt-3">
				<p>
					Finally the voting for the imposter starts: Who do you think it is?
				</p>
			</div>
		</div>
	</div>
	<div class="bg-movez-purple px-20 py-10 h-[500px] w-[900px]" v-if="slideIndex === 6">
		<div class="flex justify-between text-white text-5xl">
			<h1>STRATEGY TIPS</h1>
			<p>{{ `${slideIndex - 1 } / 5` }}</p>
		</div>
		<div class="flex items-center mt-[40px] ml-10">
			<div>
				<div>
					<img
						class="w-[70px]"
						src="../../../public/images/dog.svg"
						alt="dog"
					/>
				</div>
				<div class="relative">
					<div class="absolute bottom-[40px]">
						<img
							class="w-[40px]"
							src="../../../public/images/slider-images/drama.png"
							alt="drama"
						/>
					</div>
				</div>
			</div>
			<div class="text-white text-lg ml-10">
				<p>
					<span class="underline">Imposter:</span> Try adding small details to make your story more
				</p>
				<p>convincing. Also, don’t forget to ask your own questions.</p>
			</div>
		</div>
		<div class="flex items-center mt-[50px] ml-10">
			<div>
				<div>
					<img
						class="w-[70px]"
						src="../../../public/images/panda.svg"
						alt="panda"
					/>
				</div>
				<div class="relative">
					<div class="absolute bottom-[15px] left-[30px]">
						<img
							class="w-[75px]"
							src="../../../public/images/slider-images/monocle.png"
							alt="monocle"
						/>
					</div>
				</div>
			</div>
			<div class="text-white text-lg ml-10">
				<p>
					<span class="underline">Investigator:</span> Make sure to ask detailed questions to find the imposter. 
				</p>
				<p>Don’t forget to share your own story so that others don’t suspect you.</p>
			</div>
		</div>
		<div class="flex items-center mt-4 ml-[150px]">
			<div class="text-white text-lg">
				<p>If you need more tips during the game, you can hover over the</p>
				<p>in the top right corner.</p>
			</div>
			<div class="mb-16">
				<img
					class="w-[70px]"
					src="../../../public/images/light-bulb.svg"
					alt="light-bulb"
				/>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "HowToPlaySlides",
	props: {
		slideIndex: {
			type: Number,
			required: true,
		},
	},
};
</script>
