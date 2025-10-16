/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./screens/**/*.{js,jsx,ts,tsx}",
        "./navigation/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: "#16A349",
                accent: "#F59E0B",
                darkBg: "#0B1220",
                lightBg: "#F8FAFC",
                tileCorrect: "#16A349",
                tilePresent: "#F59E0B",
                tileAbsent: "#1F2937",
            },
            fontFamily: {
                mono: ["monospace"],
            },
        },
    },
    plugins: [],
};
