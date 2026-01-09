/** @type {import('tailwindcss').Config} */
import animate from "tailwindcss-animate"; // Add this line at the top

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // your existing theme extensions
    },
  },
  plugins: [animate], // Add the 'animate' variable here
};