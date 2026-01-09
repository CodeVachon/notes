import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DateCalendar } from "./date-calendar";

const meta: Meta<typeof DateCalendar> = {
    title: "Notebook/DateCalendar",
    component: DateCalendar,
    parameters: {
        layout: "centered"
    },
    argTypes: {
        showTodayButton: {
            control: "boolean",
            description: "Whether to show the Go to Today button"
        }
    },
    decorators: [
        (Story) => (
            <div className="w-[280px]">
                <Story />
            </div>
        )
    ]
};

export default meta;
type Story = StoryObj<typeof DateCalendar>;

export const Default: Story = {
    args: {
        selectedDate: new Date()
    }
};

export const WithSelectedDate: Story = {
    args: {
        selectedDate: new Date(2025, 0, 15)
    }
};

export const NoDateSelected: Story = {
    args: {
        selectedDate: undefined
    }
};

export const TodayButtonHidden: Story = {
    args: {
        selectedDate: new Date(),
        showTodayButton: false
    }
};

export const WithContentIndicators: Story = {
    args: {
        selectedDate: new Date(),
        datesWithContent: (() => {
            const today = new Date();
            return [
                new Date(today.getFullYear(), today.getMonth(), 3),
                new Date(today.getFullYear(), today.getMonth(), 7),
                new Date(today.getFullYear(), today.getMonth(), 12),
                new Date(today.getFullYear(), today.getMonth(), 15),
                new Date(today.getFullYear(), today.getMonth(), 21),
                new Date(today.getFullYear(), today.getMonth(), 28)
            ];
        })()
    }
};

export const ManyContentDates: Story = {
    args: {
        selectedDate: new Date(),
        datesWithContent: (() => {
            const today = new Date();
            const dates: Date[] = [];
            for (let i = 1; i <= 28; i += 2) {
                dates.push(new Date(today.getFullYear(), today.getMonth(), i));
            }
            return dates;
        })()
    }
};

export const PastMonthSelected: Story = {
    args: {
        selectedDate: (() => {
            const date = new Date();
            date.setMonth(date.getMonth() - 1);
            date.setDate(15);
            return date;
        })()
    }
};

export const FutureMonthSelected: Story = {
    args: {
        selectedDate: (() => {
            const date = new Date();
            date.setMonth(date.getMonth() + 1);
            date.setDate(10);
            return date;
        })()
    }
};
