import type { Preview } from "@storybook/nextjs-vite";
import { Buffer } from "buffer";
import "../src/styles/globals.css";

// Polyfill Buffer for browser environment
if (typeof window !== "undefined") {
    window.Buffer = Buffer;
}

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i
            }
        },
        backgrounds: { disable: true },
        a11y: {
            test: "todo"
        }
    },
    globalTypes: {
        theme: {
            description: "Theme",
            defaultValue: "light",
            toolbar: {
                title: "Theme",
                items: [
                    { value: "light", icon: "sun", title: "Light" },
                    { value: "dark", icon: "moon", title: "Dark" }
                ],
                dynamicTitle: true
            }
        }
    },
    decorators: [
        (Story, context) => {
            const theme = context.globals.theme || "light";
            return (
                <div className={theme === "dark" ? "dark" : ""}>
                    <div className="bg-background text-foreground min-h-screen p-4">
                        <Story />
                    </div>
                </div>
            );
        }
    ]
};

export default preview;
