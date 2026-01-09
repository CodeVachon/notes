import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { IconDotsVertical } from "@tabler/icons-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    CardAction
} from "./card";
import { Button } from "./button";

const meta: Meta<typeof Card> = {
    title: "UI/Card",
    component: Card,
    argTypes: {
        size: {
            control: "select",
            options: ["default", "sm"]
        }
    }
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
    render: (args) => (
        <Card {...args}>
            <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
            </CardHeader>
            <CardContent>
                <p>This is the card content. You can put any content here.</p>
            </CardContent>
            <CardFooter>
                <Button size="sm">Action</Button>
            </CardFooter>
        </Card>
    )
};

export const Small: Story = {
    args: {
        size: "sm"
    },
    render: (args) => (
        <Card {...args}>
            <CardHeader>
                <CardTitle>Small Card</CardTitle>
                <CardDescription>Compact card variant</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Content with smaller padding.</p>
            </CardContent>
        </Card>
    )
};

export const WithAction: Story = {
    render: () => (
        <Card>
            <CardHeader>
                <CardTitle>Card with Action</CardTitle>
                <CardDescription>Click the menu for options</CardDescription>
                <CardAction>
                    <Button variant="ghost" size="icon-sm">
                        <IconDotsVertical />
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <p>The action button appears in the top right corner.</p>
            </CardContent>
        </Card>
    )
};

export const SimpleContent: Story = {
    render: () => (
        <Card>
            <CardContent>
                <p>A simple card with just content, no header or footer.</p>
            </CardContent>
        </Card>
    )
};

export const WithFooterActions: Story = {
    render: () => (
        <Card>
            <CardHeader>
                <CardTitle>Confirm Action</CardTitle>
                <CardDescription>Are you sure you want to proceed?</CardDescription>
            </CardHeader>
            <CardContent>
                <p>This action cannot be undone.</p>
            </CardContent>
            <CardFooter className="justify-end gap-2">
                <Button variant="outline" size="sm">
                    Cancel
                </Button>
                <Button size="sm">Confirm</Button>
            </CardFooter>
        </Card>
    )
};

export const Stacked: Story = {
    render: () => (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>First Card</CardTitle>
                </CardHeader>
                <CardContent>Content for the first card.</CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Second Card</CardTitle>
                </CardHeader>
                <CardContent>Content for the second card.</CardContent>
            </Card>
            <Card size="sm">
                <CardHeader>
                    <CardTitle>Third Card (Small)</CardTitle>
                </CardHeader>
                <CardContent>Content for the small card.</CardContent>
            </Card>
        </div>
    )
};
