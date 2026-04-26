import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "hanoicomputercdn.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "product.hstatic.net" },
      { protocol: "https", hostname: "www.androidauthority.com" },
      { protocol: "https", hostname: "www.keychron.com" },
      { protocol: "https", hostname: "www.lg.com" },
      { protocol: "https", hostname: "cdn-files.hacom.vn" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "microless.com" },
      { protocol: "https", hostname: "cdn2.cellphones.com.vn" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "hacom.vn" },
      { protocol: "https", hostname: "kccshop.vn" },
    ],
    qualities: [70, 75, 90],
    deviceSizes: [64, 128, 256, 384, 640],
    imageSizes: [64, 96, 128, 256],
  },
};

export default nextConfig;