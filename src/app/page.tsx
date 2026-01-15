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
import { authConfig } from "@/lib/auth-config";

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
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
            {/* Animated grid background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                    style={{
                        backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px),
                                         linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px"
                    }}
                />
                {/* Radial gradient overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: `radial-gradient(ellipse 80% 50% at 50% -20%, oklch(from var(--primary) l c h / 0.15), transparent),
                                    radial-gradient(ellipse 60% 40% at 80% 100%, oklch(from var(--primary) l c h / 0.08), transparent),
                                    radial-gradient(ellipse 40% 30% at 10% 80%, oklch(from var(--primary) l c h / 0.06), transparent)`
                    }}
                />
            </div>

            {/* Floating orbs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="bg-primary/20 animate-landing-float absolute -top-20 left-1/4 size-64 rounded-full blur-3xl" />
                <div className="bg-primary/10 animate-landing-float-reverse absolute right-1/4 -bottom-32 size-96 rounded-full blur-3xl" />
                <div className="bg-primary/15 animate-landing-float-delayed absolute top-1/2 -right-20 size-48 rounded-full blur-3xl" />
            </div>

            {/* Hero section */}
            <div className="animate-landing-fade-in relative z-10 flex max-w-3xl flex-col items-center gap-8 text-center">
                {/* Logo/Title with glow effect */}
                <div className="relative">
                    <h1 className="from-foreground via-foreground to-foreground/60 bg-gradient-to-b bg-clip-text text-6xl font-bold tracking-tighter text-transparent sm:text-7xl">
                        Notes
                    </h1>
                    <div className="bg-primary/30 animate-landing-pulse absolute inset-0 -z-10 blur-2xl" />
                </div>

                {/* Subtitle */}
                <p className="text-muted-foreground animate-landing-fade-in-delay-1 max-w-xl text-lg leading-relaxed">
                    A personal note-taking and task management application. Features a daily
                    notebook system with rich-text editing, todos with priorities, automatic tag
                    extraction, and project organization.
                </p>

                {/* CTA buttons with hover effects */}
                <div className="animate-landing-fade-in-delay-2 flex gap-4">
                    {authConfig.signInEnabled && (
                        <Link
                            href="/sign-in"
                            className={cn(
                                buttonVariants({ size: "lg" }),
                                "group hover:shadow-primary/25 relative h-10 overflow-hidden px-6 text-sm shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                            )}
                        >
                            <span className="relative z-10">Sign In</span>
                            <div className="absolute inset-0 -z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </Link>
                    )}
                    <a
                        href="https://github.com/CodeVachon/notes"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            buttonVariants({ variant: "outline", size: "lg" }),
                            "group h-10 gap-2 px-6 text-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                        )}
                    >
                        <IconBrandGithub className="transition-transform duration-300 group-hover:rotate-12" />
                        GitHub
                    </a>
                </div>
            </div>

            {/* Feature cards */}
            <div className="animate-landing-fade-in-delay-3 relative z-10 mt-16 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => (
                    <Card
                        key={feature.title}
                        className="group hover:shadow-primary/10 relative backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                        {/* Card glow on hover */}
                        <div className="bg-primary/5 pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        {/* Top border accent on hover */}
                        <div className="from-primary/0 via-primary/50 to-primary/0 absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        <CardHeader className="relative pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <div className="bg-primary/10 group-hover:bg-primary/20 rounded-md p-1.5 transition-colors duration-300">
                                    <feature.icon className="text-primary size-4 transition-transform duration-300 group-hover:scale-110" />
                                </div>
                                {feature.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative">
                            <CardDescription>{feature.description}</CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tech stack badges */}
            <div className="animate-landing-fade-in-delay-4 relative z-10 mt-12 flex flex-wrap justify-center gap-2">
                {techStack.map((tech) => (
                    <Badge
                        key={tech}
                        variant="secondary"
                        className="cursor-default backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    >
                        {tech}
                    </Badge>
                ))}
            </div>

            {/* Decorative bottom line */}
            <div className="animate-landing-fade-in-delay-5 relative z-10 mt-16">
                <div className="from-primary/0 via-primary/30 to-primary/0 h-px w-48 bg-gradient-to-r" />
            </div>
        </div>
    );
}
