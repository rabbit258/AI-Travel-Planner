/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/app/**/*.{ts,tsx}",
		"./src/components/**/*.{ts,tsx}",
	],
	theme: {
		extend: {
			colors: {
				brand: {
					DEFAULT: "#0ea5e9",
					dark: "#0284c7",
				},
			},
		},
	},
	plugins: [],
};


