<template>
	<div v-if="isStatic" class="flex-1">
		<div class="progress">
			<div
				class="staticbar"
				:style="{
					transition: 'width ' + transitionSpeed + 's ease-in-out',
				}"
			/>
		</div>
	</div>
	<div v-else class="flex-1">
		<div class="progress">
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
	border: 1px solid #00d2c8;
	padding: 7px 5px;
	box-shadow: 0 0 10px #00d2c8;
}

.progress .bar {
	width: 0%;
	height: 100%;
	background: repeating-linear-gradient(
		135deg,
		#00d2c8,
		#00d2c8 10px,
		#fff 10px,
		#fff 20px
	);
	background: 0 0 10px 4px #00d2c8;
}
.progress .green-bar {
	background: repeating-linear-gradient(
		135deg,
		#00d2c8,
		#00d2c8 10px,
		#fff 10px,
		#fff 20px
	);
}

.progress .yellow-bar {
	background: repeating-linear-gradient(
		135deg,
		yellow,
		yellow 10px,
		#fff 10px,
		#fff 20px
	);
	
}

.progress .red-bar {
	background: repeating-linear-gradient(
		135deg,
		red,
		red 10px,
		#fff 10px,
		#fff 20px
	);
	
}

.progress .staticbar {
	width: 0%;
	height: 100%;
	background: repeating-linear-gradient(
		135deg,
		#00d2c8,
		#00d2c8 10px,
		#fff 10px,
		#fff 20px
	);
	background: 0 0 10px 4px #00d2c8;
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
