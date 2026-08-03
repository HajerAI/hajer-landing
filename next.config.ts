import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel builds this app from the `web` root even though the repository also
  // contains Replit's workspace. Keep Turbopack's tracing scoped to this app.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
