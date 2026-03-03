const fs = require("fs");
const { execSync } = require("child_process");

// Run Tailwind CLI directly
execSync("./node_modules/.bin/tailwindcss init -p", { stdio: "inherit" });

// Optional: update tailwind.config.js with default paths
const config = `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;

fs.writeFileSync("tailwind.config.js", config);
console.log("✅ Tailwind initialized!");
