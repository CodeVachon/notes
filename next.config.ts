import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "avatars.githubusercontent.com"
            }
        ]
    },
    devIndicators: {
        position: "bottom-right"
    }
};

export default nextConfig;
