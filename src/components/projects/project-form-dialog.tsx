"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { RichTextEditor } from "@/components/notebook/rich-text-editor";
import { createProject, updateProject } from "@/app/projects/actions";
import { cn } from "@/lib/utils";
import { projectColors, type Project, type ProjectColor } from "@/db/schema";

interface ProjectFormDialogProps {
    project?: Project;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Color picker component
function ColorPicker({
    value,
    onChange
}: {
    value: ProjectColor;
    onChange: (color: ProjectColor) => void;
}) {
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

    return (
        <div className="flex flex-wrap gap-2">
            {projectColors.map((color) => (
                <button
                    key={color}
                    type="button"
                    onClick={() => onChange(color)}
                    className={cn(
                        "size-6 rounded-full transition-all",
                        colorClasses[color],
                        value === color
                            ? "ring-2 ring-offset-2 ring-offset-background ring-foreground"
                            : "hover:scale-110"
                    )}
                    title={color.charAt(0).toUpperCase() + color.slice(1)}
                />
            ))}
        </div>
    );
}

// Form component
function ProjectForm({
    project,
    onOpenChange
}: {
    project?: Project;
    onOpenChange: (open: boolean) => void;
}) {
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState(project?.name ?? "");
    const [description, setDescription] = useState(project?.description ?? "");
    const [color, setColor] = useState<ProjectColor>((project?.color as ProjectColor) ?? "blue");
    const [emoji, setEmoji] = useState(project?.emoji ?? "");
    const [showInSidebar, setShowInSidebar] = useState(project?.showInSidebar ?? false);

    const isEditing = !!project;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        startTransition(async () => {
            if (isEditing) {
                await updateProject(project.id, {
                    name: name.trim(),
                    description,
                    color,
                    emoji: emoji.trim() || null,
                    showInSidebar
                });
            } else {
                await createProject({
                    name: name.trim(),
                    description,
                    color,
                    emoji: emoji.trim() || undefined,
                    showInSidebar
                });
            }
            onOpenChange(false);
        });
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="project-name">Name</Label>
                <Input
                    id="project-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Project name"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="project-emoji">Emoji (optional)</Label>
                    <Input
                        id="project-emoji"
                        value={emoji}
                        onChange={(e) => setEmoji(e.target.value)}
                        placeholder="e.g. ..."
                        maxLength={4}
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Color</Label>
                    <ColorPicker value={color} onChange={setColor} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label>Description (optional)</Label>
                <RichTextEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="Describe your project..."
                />
            </div>

            <div className="flex items-center gap-2">
                <Checkbox
                    id="show-in-sidebar"
                    checked={showInSidebar}
                    onCheckedChange={(checked) => setShowInSidebar(checked === true)}
                />
                <Label htmlFor="show-in-sidebar" className="cursor-pointer">
                    Show in sidebar
                </Label>
            </div>

            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button type="submit" disabled={isPending || !name.trim()}>
                    {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Project"}
                </Button>
            </AlertDialogFooter>
        </form>
    );
}

export function ProjectFormDialog({ project, open, onOpenChange }: ProjectFormDialogProps) {
    const isEditing = !!project;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {isEditing ? "Edit Project" : "Create Project"}
                    </AlertDialogTitle>
                </AlertDialogHeader>

                <ProjectForm
                    key={project?.id ?? "new"}
                    project={project}
                    onOpenChange={onOpenChange}
                />
            </AlertDialogContent>
        </AlertDialog>
    );
}
