import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { IconTag, IconX } from "@tabler/icons-react";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
    title: "UI/Badge",
    component: Badge,
    argTypes: {
        variant: {
            control: "select",
            options: ["default", "secondary", "destructive", "outline", "ghost", "link"]
        }
    }
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
    args: {
        children: "Badge"
    }
};

export const Secondary: Story = {
    args: {
        variant: "secondary",
        children: "Secondary"
    }
};

export const Destructive: Story = {
    args: {
        variant: "destructive",
        children: "Error"
    }
};

export const Outline: Story = {
    args: {
        variant: "outline",
        children: "Outline"
    }
};

export const Ghost: Story = {
    args: {
        variant: "ghost",
        children: "Ghost"
    }
};

export const LinkBadge: Story = {
    args: {
        variant: "link",
        children: "Link"
    }
};

export const WithIconStart: Story = {
    args: {
        children: (
            <>
                <IconTag data-icon="inline-start" />
                Tagged
            </>
        )
    }
};

export const WithIconEnd: Story = {
    args: {
        variant: "outline",
        children: (
            <>
                Removable
                <IconX data-icon="inline-end" />
            </>
        )
    }
};

export const AllVariants: Story = {
    render: () => (
        <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="ghost">Ghost</Badge>
            <Badge variant="link">Link</Badge>
        </div>
    )
};

export const AsLink: Story = {
    args: {
        render: <a href="#" />,
        variant: "outline",
        children: "Clickable Badge"
    }
};
