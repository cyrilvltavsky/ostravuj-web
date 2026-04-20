import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nebkxqqvbxgbifovrjoe.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  typedRoutes: true,
  experimental: {
    // Default Server Action body limit is 1 MB. Photos can be up to 5 MB
    // each and the Place form may upload up to 6 of them, so we raise
    // the limit. Higher than this and we should switch to client-side
    // direct uploads to Supabase Storage.
    serverActions: {
      bodySizeLimit: "35mb",
    },
  },
};

export default nextConfig;
