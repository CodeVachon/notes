import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { IconPlus, IconTrash, IconSettings } from "@tabler/icons-react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
    title: "UI/Button",
    component: Button,
    argTypes: {
        variant: {
            control: "select",
            options: ["default", "outline", "secondary", "ghost", "destructive", "link"]
        },
        size: {
            control: "select",
            options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"]
        },
        disabled: {
            control: "boolean"
        }
    }
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
    args: {
        children: "Button"
    }
};

export const Outline: Story = {
    args: {
        variant: "outline",
        children: "Outline"
    }
};

export const Secondary: Story = {
    args: {
        variant: "secondary",
        children: "Secondary"
    }
};

export const Ghost: Story = {
    args: {
        variant: "ghost",
        children: "Ghost"
    }
};

export const Destructive: Story = {
    args: {
        variant: "destructive",
        children: "Delete"
    }
};

export const Link: Story = {
    args: {
        variant: "link",
        children: "Link Button"
    }
};

export const WithIcon: Story = {
    args: {
        children: (
            <>
                <IconPlus data-icon="inline-start" />
                Add Item
            </>
        )
    }
};

export const IconOnly: Story = {
    args: {
        size: "icon",
        children: <IconSettings />
    }
};

export const Sizes: Story = {
    render: () => (
        <div className="flex items-center gap-2">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
        </div>
    )
};

export const IconSizes: Story = {
    render: () => (
        <div className="flex items-center gap-2">
            <Button size="icon-xs">
                <IconPlus />
            </Button>
            <Button size="icon-sm">
                <IconPlus />
            </Button>
            <Button size="icon">
                <IconPlus />
            </Button>
            <Button size="icon-lg">
                <IconPlus />
            </Button>
        </div>
    )
};

export const AllVariants: Story = {
    render: () => (
        <div className="flex flex-wrap gap-2">
            <Button variant="default">Default</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
        </div>
    )
};

export const Disabled: Story = {
    args: {
        disabled: true,
        children: "Disabled"
    }
};

export const DestructiveWithIcon: Story = {
    args: {
        variant: "destructive",
        children: (
            <>
                <IconTrash data-icon="inline-start" />
                Delete
            </>
        )
    }
};
