import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NoteCard } from "./note-card";
import type { Note, Comment, Project } from "@/db/schema";

const mockNote: Note = {
    id: "note-1",
    userId: "user-1",
    date: "2025-01-09",
    folderId: null,
    title: "Meeting Notes",
    slug: null,
    content: "<p>Discussed project timeline and deliverables.</p>",
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date()
};

const mockComments: Comment[] = [];

const mockProjects: Pick<Project, "id" | "name" | "color" | "emoji">[] = [
    { id: "proj-1", name: "Work", color: "blue", emoji: "💼" }
];

const meta: Meta<typeof NoteCard> = {
    title: "Notebook/NoteCard",
    component: NoteCard,
    parameters: {
        layout: "padded"
    },
    decorators: [
        (Story) => (
            <div className="max-w-md">
                <Story />
            </div>
        )
    ],
    args: {
        note: mockNote,
        comments: mockComments,
        projects: [],
        onEdit: () => {}
    }
};

export default meta;
type Story = StoryObj<typeof NoteCard>;

export const Default: Story = {};

export const WithLongTitle: Story = {
    args: {
        note: {
            ...mockNote,
            title: "This is a very long note title that should be truncated when it exceeds the available space"
        }
    }
};

export const WithRichContent: Story = {
    args: {
        note: {
            ...mockNote,
            title: "Technical Documentation",
            content: `
                <h3>Overview</h3>
                <p>This document covers the <strong>API integration</strong> process.</p>
                <ul>
                    <li>Authentication setup</li>
                    <li>Endpoint configuration</li>
                    <li>Error handling</li>
                </ul>
                <pre><code>const api = new ApiClient();</code></pre>
            `
        }
    }
};

export const WithTags: Story = {
    args: {
        note: {
            ...mockNote,
            title: "Sprint Planning #engineering #q1-goals"
        }
    }
};

export const WithProject: Story = {
    args: {
        note: mockNote,
        projects: mockProjects
    }
};

export const WithMultipleProjects: Story = {
    args: {
        note: mockNote,
        projects: [
            { id: "proj-1", name: "Work", color: "blue", emoji: "💼" },
            { id: "proj-2", name: "Documentation", color: "purple", emoji: "📝" }
        ]
    }
};

export const WithComments: Story = {
    args: {
        note: mockNote,
        comments: [
            {
                id: "comment-1",
                userId: "user-1",
                todoId: null,
                noteId: "note-1",
                content: "Great summary!",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: "comment-2",
                userId: "user-1",
                todoId: null,
                noteId: "note-1",
                content: "Added action items",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]
    }
};

export const MinimalContent: Story = {
    args: {
        note: {
            ...mockNote,
            title: "Quick Note",
            content: ""
        }
    }
};

export const FullyLoaded: Story = {
    args: {
        note: {
            ...mockNote,
            title: "Product Roadmap Discussion #product #strategy",
            content: `
                <p>Key decisions from today's meeting:</p>
                <ol>
                    <li>Prioritize <strong>mobile experience</strong></li>
                    <li>Launch beta in Q2</li>
                    <li>Focus on core features first</li>
                </ol>
                <blockquote>
                    <p>"Ship early, iterate often"</p>
                </blockquote>
            `
        },
        projects: [
            { id: "proj-1", name: "Product", color: "orange", emoji: "🚀" },
            { id: "proj-2", name: "Strategy", color: "green", emoji: "📊" }
        ],
        comments: [
            {
                id: "comment-1",
                userId: "user-1",
                todoId: null,
                noteId: "note-1",
                content: "Need to follow up with design team",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]
    }
};

export const CodeSnippet: Story = {
    args: {
        note: {
            ...mockNote,
            title: "API Response Format",
            content: `
                <p>Standard response structure:</p>
                <pre><code class="language-json">{
  "status": "success",
  "data": {
    "id": "123",
    "name": "Example"
  }
}</code></pre>
            `
        }
    }
};
