import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Sibling repos (traveller-client, traveller-server, ...) under the same
  // parent dir make Turbopack probe that parent as a candidate workspace
  // root, which fails module resolution (e.g. tailwindcss) and stalls
  // compiles for ~90s before falling back. Pin the root explicitly.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
