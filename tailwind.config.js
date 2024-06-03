/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./chat.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    colors: {
			"movez-black": "#323232",
			"movez-green": "#00d2c8",
			"movez-purple": "#6e0069",
		},
  },
  plugins: [],
}

