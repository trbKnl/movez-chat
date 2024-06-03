<template>
	<div class="progress">
		<div class="bar"></div>
	</div>
</template>

<script>
export default {
	name: "ProgressBar",
	// props: {
	//   value: {
	//     type: Number,
	//     required: true,
	//     validator: (value) => value >= 0 && value <= 100,
	//   },
	// }
};
</script>

<style>
.progress {
	width: 350px;
	height: 35px;
	border-radius: 4px;
	border: 1px solid #00d2c8;
	padding: 7px 5px;
	box-shadow: 0 0 10px #00d2c8;
}

.progress .bar {
	/*   width: 0%; */
	height: 100%;
	background: repeating-linear-gradient(
		135deg,
		#00d2c8,
		#00d2c8 10px,
		#fff 10px,
		#fff 20px
	);
	background: 0 0 10px 4px #00d2c8;
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
