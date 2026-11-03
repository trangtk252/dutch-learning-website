import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Dutch<->English dictionary is a plain file read at runtime (src/lib/server/dictionary-db.ts), which
  // Next's file tracing can't see, so ship it with every server function (needed on Vercel).
  outputFileTracingIncludes: {
    "/*": ["./prisma/dictionary.db"],
  },
};

export default nextConfig;
