<template>
	<div v-if="isStatic" class="flex-1">
		<div :class="['progress']" :style="dynamicStyles">
			<div
				class="staticbar"
				:style="{
					transition: 'width ' + transitionSpeed + 's ease-in-out',
				}"
			/>
		</div>
	</div>
	<div v-else class="flex-1">
		<div :class="['progress']" :style="dynamicStyles">
			<div
				class="bar"
				:class="barColorClass"
				:style="{
					width: percentageComplete + '%',
					transition: 'width ' + transitionSpeed + 's ease-in-out',
				}"
			/>
		</div>
		<div>
			<div v-if="isTimerRunning" class="text-movez-purple text-center">
				<p v-if="secondsToDisplay > 0">
					Time Left: {{ secondsToDisplay }} seconds
				</p>
				<p v-else>Time's up!</p>
			</div>
		</div>
	</div>
</template>
<script>
export default {
	name: "ProgressBar",
	props: {
		percentageComplete: {
			type: Number,
			required: false,
			validator: (percentageComplete) =>
				percentageComplete >= 0 && percentageComplete <= 100,
		},
		isStatic: {
			type: Boolean,
			default: false,
		},
		transitionSpeed: {
			type: Number,
			default: 1,
		},
		showTimerOnPercentageComplete: {
			type: Number,
			default: -1,
		},
		secondsLeft: {
			type: Number,
			default: -1,
		},
	},
	data() {
		return {
			timer: null,
			isTimerRunning: false,
			secondsToDisplay: -1,
			barColorClass: "green-bar",
		};
	},
	computed: {
		dynamicStyles() {
			let boxShadow, border;
			switch (this.barColorClass) {
				case "red-bar":
					boxShadow = "0 0 3px #ff5e5b";
					border = "1px solid #ff5e5b";
					break;
				case "yellow-bar":
					boxShadow = "0 0 3px #ffed66";
					border = "1px solid #ffed66";
					break;
				case "green-bar":
				default:
					boxShadow = "0 0 3px #00cecb";
					border = "1px solid #00cecb";
					break;
			}
			return {
				boxShadow,
				border,
			};
		},
	},
	watch: {
		percentageComplete(val) {
			if (
				this.secondsLeft !== -1 &&
				!this.isTimerRunning &&
				val >= this.showTimerOnPercentageComplete
			) {
				this.startTimer();
				this.isTimerRunning = true;
				this.updateBarColor(val);
			}
		},
		secondsToDisplay(val) {
			if (val === 0) {
				this.stopTimer();
			}
			this.updateBarColor(this.percentageComplete);
		},
	},
	methods: {
		startTimer() {
			this.secondsToDisplay = this.secondsLeft;
			this.timer = setInterval(() => {
				if (this.secondsToDisplay > 0) {
					this.secondsToDisplay--;
				} else {
					this.stopTimer();
				}
			}, 1000);
		},
		stopTimer() {
			this.isTimerRunning = false;
			this.secondsToDisplay = -1;
			this.timer = null;
			clearInterval(this.timer);
		},
		updateBarColor(percentage) {
			if (percentage >= 80) {
				this.barColorClass = "red-bar";
			} else if (percentage >= 60) {
				this.barColorClass = "yellow-bar";
			} else {
				this.barColorClass = "green-bar";
			}
		},
		beforeDestroy() {
			this.stopTimer();
		},
	},
};
</script>
<style>
.progress {
	width: 100%;
	height: 100%;
	border-radius: 4px;
	padding: 7px 5px;
}

.progress .bar {
	width: 0%;
	height: 100%;
	background: repeating-linear-gradient(
		135deg,
		#00cecb,
		#00cecb 10px,
		#ffffff00 10px,
		#ffffff00 20px
	);
}

.progress .green-bar {
	background: repeating-linear-gradient(
		135deg,
		#00cecb,
		#00cecb 10px,
		#ffffff00 10px,
		#ffffff00 20px
	);
}

.progress .yellow-bar {
	background: repeating-linear-gradient(
		135deg,
		#ffed66,
		#ffed66 10px,
		#ffffff00 10px,
		#ffffff00 20px
	);
}

.progress .red-bar {
	background: repeating-linear-gradient(
		135deg,
		#ff5e5b,
		#ff5e5b 10px,
		#ffffff00 10px,
		#ffffff00 20px
	);
}

.progress .staticbar {
	width: 0%;
	height: 100%;
	background: repeating-linear-gradient(
		135deg,
		#00cecb,
		#00cecb 10px,
		#ffffff00 10px,
		#ffffff00 20px
	);
	transition: width 1s ease-in-out;
	animation: initial-animation 1s forwards, cyclic-animation 5s infinite 1s;
}

@keyframes initial-animation {
	0% {
		width: 0%;
	}
	100% {
		width: 100%;
	}
}

@keyframes cyclic-animation {
	0% {
		width: 10%;
	}
	25% {
		width: 100%;
	}
	50% {
		width: 20%;
	}
	75% {
		width: 100%;
	}
	100% {
		width: 100%;
	}
}
</style>
