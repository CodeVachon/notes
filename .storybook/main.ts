import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: [
        "@chromatic-com/storybook",
        "@storybook/addon-vitest",
        "@storybook/addon-a11y",
        "@storybook/addon-docs"
    ],
    framework: "@storybook/nextjs-vite",
    staticDirs: ["../public"],
    async viteFinal(config) {
        const { mergeConfig } = await import("vite");
        return mergeConfig(config, {
            define: {
                Buffer: ["buffer", "Buffer"]
            },
            resolve: {
                alias: {
                    buffer: "buffer/"
                }
            },
            optimizeDeps: {
                include: ["buffer"]
            }
        });
    }
};
export default config;
