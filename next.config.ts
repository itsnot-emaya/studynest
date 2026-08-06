import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/studynest",
  assetPrefix: "/studynest/",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
