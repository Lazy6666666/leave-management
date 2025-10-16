import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Ensure Next.js uses the monorepo root so it discovers local configs (e.g. postcss.config.js)
  // This fixes the workspace root inference warning and resolves malformed PostCSS config issues.
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
