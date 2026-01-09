"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    IconChevronRight,
    IconHome,
    IconTrash,
    IconArrowLeft,
    IconDeviceFloppy,
    IconPencil,
    IconEye
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/notebook/rich-text-editor";
import { HtmlContent } from "@/components/notebook/html-content";
import { ProjectSelector } from "@/components/notebook/project-selector";
import { ProjectBadge } from "@/components/notebook/project-badge";
import { TitleWithTags } from "@/components/notebook/title-with-tags";
import { updateGenericNote, deleteGenericNote } from "@/app/notebook/notes/actions";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { Note, Project } from "@/db/schema";

type ViewMode = "rendered" | "edit";

interface GenericNoteEditorProps {
    note: Note;
    breadcrumbs: Array<{ id: string; name: string; slug: string }>;
    projects: Project[];
    initialProjectIds: string[];
}

export function GenericNoteEditor({
    note,
    breadcrumbs,
    projects,
    initialProjectIds
}: GenericNoteEditorProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [viewMode, setViewMode] = useState<ViewMode>("rendered");
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [projectIds, setProjectIds] = useState<string[]>(initialProjectIds);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const parentPath = breadcrumbs.map((b) => b.slug).join("/");
    const backPath = parentPath ? `/notebook/notes/${parentPath}` : "/notebook/notes";

    const selectedProjects = projects.filter((p) => projectIds.includes(p.id));

    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle);
        setHasChanges(true);
    };

    const handleContentChange = (newContent: string) => {
        setContent(newContent);
        setHasChanges(true);
    };

    const handleProjectsChange = (newProjectIds: string[]) => {
        setProjectIds(newProjectIds);
        setHasChanges(true);
    };

    const handleSave = () => {
        if (!title.trim()) return;

        startTransition(async () => {
            await updateGenericNote(note.id, {
                title: title.trim(),
                content,
                projectIds
            });
            setHasChanges(false);
        });
    };

    const handleDelete = () => {
        startTransition(async () => {
            await deleteGenericNote(note.id);
            router.push(backPath);
        });
    };

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-4">
                    <Link href={backPath} className="flex">
                        <Button variant="ghost" size="sm">
                            <IconArrowLeft className="size-4" />
                            Back
                        </Button>
                    </Link>

                    {/* Breadcrumbs */}
                    <nav className="text-muted-foreground hidden items-center gap-1 text-sm md:flex">
                        <Link
                            href="/notebook/notes"
                            className="hover:text-foreground flex items-center transition-colors"
                        >
                            <IconHome className="size-4" />
                        </Link>
                        {breadcrumbs.map((crumb, index) => {
                            const path = breadcrumbs
                                .slice(0, index + 1)
                                .map((b) => b.slug)
                                .join("/");

                            return (
                                <span key={crumb.id} className="flex items-center gap-1">
                                    <IconChevronRight className="size-4" />
                                    <Link
                                        href={`/notebook/notes/${path}`}
                                        className="hover:text-foreground transition-colors"
                                    >
                                        {crumb.name}
                                    </Link>
                                </span>
                            );
                        })}
                        <IconChevronRight className="size-4" />
                        <span className="text-foreground font-medium">{note.title}</span>
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="bg-muted flex rounded-lg p-1">
                        <button
                            onClick={() => setViewMode("rendered")}
                            className={cn(
                                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                                viewMode === "rendered"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <IconEye className="size-4" />
                            <span className="hidden sm:inline">View</span>
                        </button>
                        <button
                            onClick={() => setViewMode("edit")}
                            className={cn(
                                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                                viewMode === "edit"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <IconPencil className="size-4" />
                            <span className="hidden sm:inline">Edit</span>
                        </button>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteDialogOpen(true)}
                        className="text-destructive hover:text-destructive"
                    >
                        <IconTrash className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    {viewMode === "rendered" ? (
                        <>
                            {/* Rendered Title */}
                            <h1 className="text-2xl font-bold">
                                <TitleWithTags title={title} />
                            </h1>

                            {/* Project Badges */}
                            {selectedProjects.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedProjects.map((project) => (
                                        <ProjectBadge key={project.id} project={project} asLink />
                                    ))}
                                </div>
                            )}

                            {/* Rendered Content */}
                            <div className="min-h-[400px]">
                                {content && content !== "<p></p>" ? (
                                    <HtmlContent content={content} />
                                ) : (
                                    <p className="text-muted-foreground italic">
                                        No content yet. Click Edit to add content.
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Editable Title */}
                            <Input
                                value={title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="Note title"
                                className="border-none bg-transparent text-2xl font-bold focus-visible:ring-0"
                            />

                            {/* Projects Selector */}
                            {projects.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-sm">Projects:</span>
                                    <ProjectSelector
                                        projects={projects}
                                        selectedProjectIds={projectIds}
                                        onProjectsChange={handleProjectsChange}
                                        disabled={isPending}
                                    />
                                </div>
                            )}

                            {/* Editor */}
                            <RichTextEditor
                                content={content}
                                onChange={handleContentChange}
                                placeholder="Start writing..."
                            />

                            {/* Save Button */}
                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={handleSave}
                                    disabled={isPending || !hasChanges || !title.trim()}
                                >
                                    <IconDeviceFloppy className="size-4" />
                                    {isPending ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Note</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{note.title}&quot;? This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
