import type { NextConfig } from "next";

// NEXT_PUBLIC_API_URL is automatically exposed to the browser via the NEXT_PUBLIC_ prefix.
// Add server-only runtime env vars here using the `env` key when needed.
const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
