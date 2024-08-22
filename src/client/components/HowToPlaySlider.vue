<template>
	<div class="relative mt-10 w-[900px]">
		<HowToPlaySlides
			:slideIndex="slideIndex"
			:active="active"
			:slides="slides"
		/>
		<div
			v-if="slideIndex !== 6"
			class="absolute right-0 bottom-[35%] mr-3 cursor-pointer"
			@click="slideRight"
		>
			<img
				class="w-[65px]"
				src="../../../public/images/slider-images/right-arrow.png"
				alt="right-arrow"
			/>
		</div>
		<div
			v-if="slideIndex !== 1"
			class="absolute left-0 bottom-[35%] ml-3 cursor-pointer"
			@click="slideLeft"
		>
			<img
				class="w-[60px]"
				src="../../../public/images/slider-images/left-arrow.png"
				alt="left-arrow"
			/>
		</div>
	</div>
</template>

<script>
import HowToPlaySlides from "./HowToPlaySlides.vue";
export default {
	name: "HowToPlaySlider",
	components: {
		HowToPlaySlides,
	},
	data() {
		return {
			slideIndex: 1,
		};
	},
	watch: {
		slideIndex(newValue) {
			this.$emit("updateSlideIndex", newValue);
		},
	},
	methods: {
		slideLeft() {
			this.slideIndex--;
			if (this.slideIndex == 0) {
				this.slideIndex = this.slides.length;
			}
		},

		slideRight() {
			this.slideIndex++;
			if (this.slideIndex > this.slides.length) {
				this.slideIndex = 1;
			}
		},
	},
};
</script>
