import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // Cloudflare Workers 배포 시 Images 바인딩 없이 동작하도록 최적화 비활성화
    // (썸네일은 S3 URL 을 그대로 사용)
    unoptimized: true,
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
