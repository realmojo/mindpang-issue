import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mindpang-image.s3.ap-northeast-2.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mindpang-image.s3.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
