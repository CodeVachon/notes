"use client";

import * as React from "react";
import { IconX } from "@tabler/icons-react";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty
} from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Project, ProjectColor } from "@/db/schema";

// Color dot component for showing project color
function ColorDot({ color }: { color: ProjectColor }) {
    const colorClasses: Record<ProjectColor, string> = {
        red: "bg-red-500",
        orange: "bg-orange-500",
        yellow: "bg-yellow-500",
        green: "bg-green-500",
        blue: "bg-blue-500",
        purple: "bg-purple-500",
        pink: "bg-pink-500",
        gray: "bg-gray-500"
    };

    return <span className={cn("size-2 shrink-0 rounded-full", colorClasses[color])} />;
}

interface ProjectSelectorProps {
    projects: Project[];
    selectedProjectIds: string[];
    onProjectsChange: (projectIds: string[]) => void;
    disabled?: boolean;
    placeholder?: string;
}

export function ProjectSelector({
    projects,
    selectedProjectIds,
    onProjectsChange,
    disabled = false,
    placeholder = "Add to projects..."
}: ProjectSelectorProps) {
    const selectedProjects = projects.filter((p) => selectedProjectIds.includes(p.id));

    const handleValueChange = (newIds: string[]) => {
        onProjectsChange(newIds);
    };

    const handleRemove = (projectId: string) => {
        onProjectsChange(selectedProjectIds.filter((id) => id !== projectId));
    };

    return (
        <div className="space-y-2">
            {/* Selected projects as chips */}
            {selectedProjects.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {selectedProjects.map((project) => (
                        <span
                            key={project.id}
                            className="bg-muted inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs"
                        >
                            <ColorDot color={project.color as ProjectColor} />
                            {project.emoji && <span>{project.emoji}</span>}
                            <span>{project.name}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(project.id)}
                                className="text-muted-foreground hover:text-foreground -mr-0.5 ml-0.5"
                                disabled={disabled}
                            >
                                <IconX className="size-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Combobox for adding projects */}
            <Combobox
                value={selectedProjectIds}
                onValueChange={handleValueChange}
                multiple
                disabled={disabled}
            >
                <ComboboxInput placeholder={placeholder} showClear={false} />
                <ComboboxContent>
                    <ComboboxList>
                        {projects.map((project) => (
                            <ComboboxItem key={project.id} value={project.id}>
                                <ColorDot color={project.color as ProjectColor} />
                                {project.emoji && <span>{project.emoji}</span>}
                                <span>{project.name}</span>
                            </ComboboxItem>
                        ))}
                    </ComboboxList>
                    <ComboboxEmpty>No projects found</ComboboxEmpty>
                </ComboboxContent>
            </Combobox>
        </div>
    );
}
