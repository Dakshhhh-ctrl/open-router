/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui"],
  devIndicators: false,
  env: {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ?? "",
    OPENAI_API_KEY: process.env.OPENROUTER_API_KEY ?? "",
  },
};

module.exports = nextConfig;

// HunterOS — devIndicators disabled
