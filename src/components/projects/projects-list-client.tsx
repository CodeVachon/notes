"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { IconSearch, IconFolder, IconPlus } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProjectBadge } from "@/components/notebook/project-badge";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import type { Project } from "@/db/schema";

interface ProjectWithCount extends Project {
    itemCount: number;
}

interface ProjectsListClientProps {
    projects: ProjectWithCount[];
}

export function ProjectsListClient({ projects }: ProjectsListClientProps) {
    const [search, setSearch] = useState("");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // Filter projects based on search
    const filteredProjects = useMemo(() => {
        if (!search) return projects;
        const lower = search.toLowerCase();
        return projects.filter((p) => p.name.toLowerCase().includes(lower));
    }, [projects, search]);

    // Group projects by first letter for alphabetical sections
    const grouped = useMemo(() => {
        const groups: Record<string, typeof filteredProjects> = {};
        filteredProjects.forEach((project) => {
            const letter = project.name[0].toUpperCase();
            if (!groups[letter]) groups[letter] = [];
            groups[letter].push(project);
        });
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    }, [filteredProjects]);

    return (
        <div className="space-y-6">
            {/* Search and Create */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <IconSearch className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
                    <Input
                        placeholder="Search projects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <IconPlus className="size-4" />
                    New Project
                </Button>
            </div>

            {/* Projects List */}
            {grouped.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                    <IconFolder className="text-muted-foreground size-8" />
                    <p className="text-muted-foreground text-sm">
                        {projects.length === 0
                            ? "No projects yet. Create one to organize your notes and todos."
                            : "No projects match your search."}
                    </p>
                    {projects.length === 0 && (
                        <Button
                            variant="outline"
                            className="mt-2"
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            <IconPlus className="size-4" />
                            Create your first project
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {grouped.map(([letter, letterProjects]) => (
                        <div key={letter}>
                            <h2 className="text-muted-foreground mb-3 text-sm font-medium">
                                {letter}
                            </h2>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {letterProjects.map((project) => (
                                    <Link key={project.id} href={`/projects/${project.id}`}>
                                        <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
                                            <CardHeader className="p-4">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <CardTitle className="flex items-center gap-2 text-sm">
                                                            {project.emoji && (
                                                                <span>{project.emoji}</span>
                                                            )}
                                                            <span className="truncate">
                                                                {project.name}
                                                            </span>
                                                        </CardTitle>
                                                        <CardDescription className="mt-1">
                                                            {project.itemCount}{" "}
                                                            {project.itemCount === 1
                                                                ? "item"
                                                                : "items"}
                                                        </CardDescription>
                                                    </div>
                                                    <ProjectBadge project={project} />
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Dialog */}
            <ProjectFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
        </div>
    );
}
