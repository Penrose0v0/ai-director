import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Director-room palette
        ink: "#0a0a0f",
        panel: "#14141c",
        panel2: "#1c1c28",
        line: "#2a2a3a",
        accent: "#ff5c38", // clapperboard orange-red
        accent2: "#3b82f6",
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
