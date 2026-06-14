import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Typst compiler is a native (.node) addon — keep it out of the bundle so
  // the platform-specific binary is required from node_modules at runtime.
  serverExternalPackages: ["@myriaddreamin/typst-ts-node-compiler"],
};

export default nextConfig;
