import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TodoItem } from "./todo-item";
import { SettingsProvider } from "@/lib/settings-context";
import type { Todo, Comment, Project, UserSettings } from "@/db/schema";

const mockSettings: UserSettings = {
    id: "settings-1",
    userId: "user-1",
    timeFormat: "12h",
    primaryColorL: null,
    primaryColorC: null,
    primaryColorH: null,
    createdAt: new Date(),
    updatedAt: new Date()
};

const mockTodo: Todo = {
    id: "todo-1",
    userId: "user-1",
    date: "2025-01-09",
    title: "Complete project documentation",
    description: null,
    priority: "medium",
    dueTime: null,
    completed: false,
    completedAt: null,
    sourceId: null,
    createdAt: new Date(),
    updatedAt: new Date()
};

const mockComments: Comment[] = [];

const mockProjects: Pick<Project, "id" | "name" | "color" | "emoji">[] = [
    { id: "proj-1", name: "Work", color: "#3b82f6", emoji: "💼" }
];

const meta: Meta<typeof TodoItem> = {
    title: "Notebook/TodoItem",
    component: TodoItem,
    parameters: {
        layout: "padded"
    },
    decorators: [
        (Story) => (
            <SettingsProvider settings={mockSettings}>
                <div className="max-w-xl">
                    <Story />
                </div>
            </SettingsProvider>
        )
    ],
    args: {
        todo: mockTodo,
        comments: mockComments,
        projects: [],
        onEdit: () => {}
    }
};

export default meta;
type Story = StoryObj<typeof TodoItem>;

export const Default: Story = {};

export const HighPriority: Story = {
    args: {
        todo: { ...mockTodo, priority: "high", title: "Urgent: Fix production bug" }
    }
};

export const LowPriority: Story = {
    args: {
        todo: { ...mockTodo, priority: "low", title: "Nice to have feature" }
    }
};

export const Completed: Story = {
    args: {
        todo: { ...mockTodo, completed: true, completedAt: new Date() }
    }
};

export const WithDescription: Story = {
    args: {
        todo: {
            ...mockTodo,
            title: "Review pull request",
            description: "<p>Check the <strong>API changes</strong> and ensure backwards compatibility.</p>"
        }
    }
};

export const WithDueTime: Story = {
    args: {
        todo: { ...mockTodo, dueTime: "14:30", title: "Team meeting" }
    }
};

export const WithProject: Story = {
    args: {
        todo: mockTodo,
        projects: mockProjects
    }
};

export const WithMultipleProjects: Story = {
    args: {
        todo: mockTodo,
        projects: [
            { id: "proj-1", name: "Work", color: "#3b82f6", emoji: "💼" },
            { id: "proj-2", name: "Personal", color: "#22c55e", emoji: "🏠" }
        ]
    }
};

export const CopiedFromAnotherDate: Story = {
    args: {
        todo: { ...mockTodo, sourceId: "original-todo-1" },
        sourceDate: "2025-01-05"
    }
};

export const WithComments: Story = {
    args: {
        todo: mockTodo,
        comments: [
            {
                id: "comment-1",
                userId: "user-1",
                todoId: "todo-1",
                noteId: null,
                content: "Added more details to this task",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]
    }
};

export const FullyLoaded: Story = {
    args: {
        todo: {
            ...mockTodo,
            title: "Complete quarterly report #work",
            description: "<p>Include all <em>Q4 metrics</em> and projections for next quarter.</p>",
            priority: "high",
            dueTime: "17:00"
        },
        projects: mockProjects,
        comments: [
            {
                id: "comment-1",
                userId: "user-1",
                todoId: "todo-1",
                noteId: null,
                content: "Draft completed, needs review",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]
    }
};

export const TimeFormat24h: Story = {
    decorators: [
        (Story) => (
            <SettingsProvider settings={{ ...mockSettings, timeFormat: "24h" }}>
                <div className="max-w-xl">
                    <Story />
                </div>
            </SettingsProvider>
        )
    ],
    args: {
        todo: { ...mockTodo, dueTime: "14:30", title: "Afternoon meeting" }
    }
};
