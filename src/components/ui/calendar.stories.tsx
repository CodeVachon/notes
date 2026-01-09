import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Calendar } from "./calendar";

const meta: Meta<typeof Calendar> = {
    title: "UI/Calendar",
    component: Calendar,
    parameters: {
        layout: "centered"
    },
    argTypes: {
        showOutsideDays: {
            control: "boolean"
        },
        showWeekNumber: {
            control: "boolean"
        }
    }
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
    args: {
        mode: "single"
    }
};

export const WithSelectedDate: Story = {
    args: {
        mode: "single",
        selected: new Date()
    }
};

export const WithoutOutsideDays: Story = {
    args: {
        mode: "single",
        showOutsideDays: false
    }
};

export const WithWeekNumbers: Story = {
    args: {
        mode: "single",
        showWeekNumber: true
    }
};

export const RangeSelection: Story = {
    args: {
        mode: "range",
        selected: {
            from: new Date(2025, 0, 10),
            to: new Date(2025, 0, 20)
        }
    }
};

export const MultipleMonths: Story = {
    args: {
        mode: "single",
        numberOfMonths: 2
    }
};

export const WithContentIndicators: Story = {
    args: {
        mode: "single",
        selected: new Date(),
        modifiers: {
            hasContent: (() => {
                const today = new Date();
                return [
                    new Date(today.getFullYear(), today.getMonth(), 5),
                    new Date(today.getFullYear(), today.getMonth(), 12),
                    new Date(today.getFullYear(), today.getMonth(), 18),
                    new Date(today.getFullYear(), today.getMonth(), 25)
                ];
            })()
        },
        modifiersClassNames: {
            hasContent:
                "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:size-1 after:rounded-full after:bg-primary"
        }
    }
};

export const DisabledWeekends: Story = {
    args: {
        mode: "single",
        disabled: (date: Date) => date.getDay() === 0 || date.getDay() === 6
    }
};

export const LimitedDateRange: Story = {
    args: {
        mode: "single",
        fromDate: new Date(),
        toDate: (() => {
            const date = new Date();
            date.setMonth(date.getMonth() + 2);
            return date;
        })()
    }
};

export const DropdownNavigation: Story = {
    args: {
        mode: "single",
        captionLayout: "dropdown"
    }
};
