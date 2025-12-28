import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
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
