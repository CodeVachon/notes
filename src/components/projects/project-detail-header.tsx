"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction
} from "@/components/ui/alert-dialog";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { deleteProject } from "@/app/projects/actions";
import type { Project } from "@/db/schema";

interface ProjectDetailHeaderProps {
    project: Project;
}

export function ProjectDetailHeader({ project }: ProjectDetailHeaderProps) {
    const router = useRouter();
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            await deleteProject(project.id);
            router.push("/projects");
        });
    };

    return (
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-xs" onClick={() => setEditOpen(true)}>
                <IconEdit className="size-4" />
            </Button>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogTrigger render={<Button variant="ghost" size="icon-xs" />}>
                    <IconTrash className="size-4" />
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{project.name}"? This action cannot be
                            undone. Items assigned to this project will not be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <ProjectFormDialog project={project} open={editOpen} onOpenChange={setEditOpen} />
        </div>
    );
}
