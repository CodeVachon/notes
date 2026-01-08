import Link from "next/link";
import {
    IconBrandGithub,
    IconCalendar,
    IconChecklist,
    IconNotes,
    IconTags,
    IconFolders,
    IconLock
} from "@tabler/icons-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const features = [
    {
        icon: IconCalendar,
        title: "Daily Notebook",
        description: "Date-based note-taking with calendar navigation and smart date labels"
    },
    {
        icon: IconChecklist,
        title: "Todo Management",
        description: "Todos with priorities, due times, and the ability to copy between dates"
    },
    {
        icon: IconNotes,
        title: "Rich-Text Notes",
        description: "Full formatting with headings, lists, code blocks, links, and YouTube embeds"
    },
    {
        icon: IconTags,
        title: "Tag System",
        description: "Automatic tag extraction using [[tagname]] syntax with autocomplete"
    },
    {
        icon: IconFolders,
        title: "Projects",
        description: "Organize notes and todos into projects with custom colors and emoji icons"
    },
    {
        icon: IconLock,
        title: "Private",
        description: "GitHub OAuth authentication with restricted access"
    }
];

const techStack = [
    "Next.js 16",
    "TypeScript",
    "PostgreSQL",
    "Drizzle ORM",
    "Better Auth",
    "Tailwind CSS",
    "Tiptap"
];

export default function Page() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12">
            <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
                <h1 className="text-4xl font-bold tracking-tight">Notes</h1>
                <p className="text-muted-foreground max-w-xl text-lg">
                    A personal note-taking and task management application. Features a daily
                    notebook system with rich-text editing, todos with priorities, automatic tag
                    extraction, and project organization.
                </p>

                <div className="flex gap-3">
                    <Link href="/sign-in" className={cn(buttonVariants({ size: "lg" }))}>
                        Sign In
                    </Link>
                    <a
                        href="https://github.com/CodeVachon/notes"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                    >
                        <IconBrandGithub />
                        GitHub
                    </a>
                </div>
            </div>

            <div className="grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => (
                    <Card key={feature.title}>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <feature.icon className="text-primary size-4" />
                                {feature.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{feature.description}</CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
                {techStack.map((tech) => (
                    <Badge key={tech} variant="secondary">
                        {tech}
                    </Badge>
                ))}
            </div>
        </div>
    );
}
