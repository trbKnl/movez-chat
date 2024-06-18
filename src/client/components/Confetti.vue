<template>
	<canvas
		ref="canvas"
		class="fixed inset-0 w-full h-full pointer-events-none z-50"
	></canvas>
</template>

<script>
export default {
	name: "Confetti",
	mounted() {
		this.initConfetti();
		window.addEventListener("resize", this.resizeCanvas);
	},
	beforeDestroy() {
		window.removeEventListener("resize", this.resizeCanvas);
		cancelAnimationFrame(this.animationFrame);
	},
	methods: {
		initConfetti() {
			this.canvas = this.$refs.canvas;
			this.context = this.canvas.getContext("2d");
			this.resizeCanvas();
			this.createConfetti();
			this.step();
		},
		resizeCanvas() {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
		},
		createConfetti() {
			this.confetti = [];
			for (let i = 0; i < 350; i++) {
				this.confetti.push(new Confetti(this.canvas));
			}
		},
		step() {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.confetti.forEach((c) => c.update());
			this.animationFrame = requestAnimationFrame(this.step);
		},
	},
};

class Confetti {
	constructor(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
		this.colors = [
			[85, 71, 106],
			[174, 61, 99],
			[219, 56, 83],
			[244, 92, 68],
			[248, 182, 70],
		];
		this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
		this.x = Math.random() * this.canvas.width;
		this.y = Math.random() * this.canvas.height - this.canvas.height;
		this.r = Math.random() * 4 + 1;
		this.d = Math.random() * 4 + 1;
		this.vx = Math.random() * 2 - 1;
		this.vy = Math.random() * 2 + 2;
	}

	update() {
		this.x += this.vx;
		this.y += this.vy;
		if (this.y > this.canvas.height) {
			this.x = Math.random() * this.canvas.width;
			this.y = -this.r;
		}
		this.draw();
	}

	draw() {
		this.context.beginPath();
		this.context.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
		this.context.fillStyle = `rgba(${this.color.join(",")}, 0.8)`;
		this.context.fill();
	}
}
</script>

<style scoped>
 
</style>
