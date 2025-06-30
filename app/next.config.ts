import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      new URL("https://fit-api.infiniter.tech/**"),
      new URL("http://localhost:8080/**"),
    ],
  },
  /* config options here */
};

export default nextConfig;
