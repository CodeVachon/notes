import { notFound } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconFolder, IconEdit, IconTrash } from "@tabler/icons-react";
import { getProjectById, getProjectItems } from "@/app/projects/actions";
import { Button } from "@/components/ui/button";
import { ProjectBadge } from "@/components/notebook/project-badge";
import { HtmlContent } from "@/components/notebook/html-content";
import { ProjectItemsClient } from "@/components/projects/project-items-client";
import { ProjectDetailHeader } from "@/components/projects/project-detail-header";

interface ProjectPageProps {
    params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
        notFound();
    }

    const data = await getProjectItems(id);
    const totalItems = data ? data.notes.length + data.todos.length : 0;

    return (
        <div className="flex h-full flex-col">
            <div className="relative flex h-14 items-center gap-2 border-b px-4">
                <Link href="/projects">
                    <Button variant="ghost" size="icon-xs">
                        <IconArrowLeft className="size-4" />
                    </Button>
                </Link>
                <div className="flex flex-1 items-center gap-2">
                    {project.emoji && <span className="text-lg">{project.emoji}</span>}
                    <h1 className="text-lg font-semibold">{project.name}</h1>
                    <ProjectBadge project={project} />
                </div>
                <span className="text-muted-foreground text-sm">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
                <ProjectDetailHeader project={project} />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-3xl space-y-6">
                    {/* Project Description */}
                    {project.description &&
                        project.description !== "" &&
                        project.description !== "<p></p>" && (
                            <div className="rounded-lg border p-4">
                                <HtmlContent content={project.description} />
                            </div>
                        )}

                    {/* Project Items */}
                    {totalItems === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                            <IconFolder className="text-muted-foreground size-8" />
                            <p className="text-muted-foreground text-sm">
                                No items in this project yet.
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Add notes or todos to this project from the notebook.
                            </p>
                        </div>
                    ) : (
                        <ProjectItemsClient
                            notes={data!.notes}
                            todos={data!.todos}
                            noteComments={data!.noteComments}
                            todoComments={data!.todoComments}
                            dates={data!.dates}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
