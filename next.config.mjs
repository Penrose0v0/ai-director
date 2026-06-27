/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a self-contained server (.next/standalone) for a small Cloud Run image.
  output: "standalone",
};

export default nextConfig;
