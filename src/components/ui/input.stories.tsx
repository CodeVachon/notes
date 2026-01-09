import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
    title: "UI/Input",
    component: Input,
    argTypes: {
        type: {
            control: "select",
            options: ["text", "email", "password", "number", "search", "tel", "url"]
        },
        placeholder: {
            control: "text"
        },
        disabled: {
            control: "boolean"
        }
    }
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
    args: {
        placeholder: "Enter text..."
    }
};

export const WithValue: Story = {
    args: {
        defaultValue: "Hello World"
    }
};

export const Email: Story = {
    args: {
        type: "email",
        placeholder: "email@example.com"
    }
};

export const Password: Story = {
    args: {
        type: "password",
        placeholder: "Enter password"
    }
};

export const Number: Story = {
    args: {
        type: "number",
        placeholder: "0"
    }
};

export const Search: Story = {
    args: {
        type: "search",
        placeholder: "Search..."
    }
};

export const Disabled: Story = {
    args: {
        disabled: true,
        placeholder: "Disabled input"
    }
};

export const DisabledWithValue: Story = {
    args: {
        disabled: true,
        defaultValue: "Cannot edit this"
    }
};

export const Invalid: Story = {
    args: {
        "aria-invalid": true,
        defaultValue: "Invalid value"
    }
};

export const File: Story = {
    args: {
        type: "file"
    }
};

export const AllTypes: Story = {
    render: () => (
        <div className="space-y-2">
            <Input type="text" placeholder="Text input" />
            <Input type="email" placeholder="Email input" />
            <Input type="password" placeholder="Password input" />
            <Input type="number" placeholder="Number input" />
            <Input type="search" placeholder="Search input" />
            <Input type="tel" placeholder="Phone input" />
            <Input type="url" placeholder="URL input" />
        </div>
    )
};
