import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FolderBrowser } from "@/components/notes/folder-browser";
import { GenericNoteEditor } from "@/components/notes/generic-note-editor";
import {
    resolvePathToItem,
    getFolderContents,
    getFolderBreadcrumbs,
    getFolderItemCounts
} from "@/app/notebook/notes/actions";
import { getAllProjects, getProjectsForItems } from "@/app/projects/actions";

export const dynamic = "force-dynamic";

interface NotesPathPageProps {
    params: Promise<{ path: string[] }>;
}

export async function generateMetadata({ params }: NotesPathPageProps): Promise<Metadata> {
    const { path } = await params;
    const resolved = await resolvePathToItem(path);

    if (resolved.type === "folder" && resolved.folder) {
        return { title: `${resolved.folder.name} - Notes` };
    }

    if (resolved.type === "note" && resolved.note) {
        return { title: `${resolved.note.title} - Notes` };
    }

    return { title: "Notes" };
}

export default async function NotesPathPage({ params }: NotesPathPageProps) {
    const { path } = await params;
    const resolved = await resolvePathToItem(path);

    if (resolved.type === "not_found") {
        notFound();
    }

    // Get all projects for editors
    const projects = await getAllProjects();

    if (resolved.type === "folder") {
        // Get folder contents
        const folderId = resolved.folder?.id ?? null;
        const { folder, childFolders, notes } = await getFolderContents(folderId);
        const breadcrumbs = await getFolderBreadcrumbs(folderId);

        // Get project assignments for notes
        const noteProjects = await getProjectsForItems(
            "note",
            notes.map((n) => n.id)
        );

        // Get item counts for child folders
        const folderCounts = await getFolderItemCounts(childFolders.map((f) => f.id));

        return (
            <div className="flex h-full flex-col">
                <div className="relative flex h-14 items-center border-b px-4">
                    <h1 className="text-lg font-semibold">{folder?.name ?? "Notes"}</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mx-auto max-w-5xl">
                        <FolderBrowser
                            folder={folder}
                            childFolders={childFolders}
                            notes={notes}
                            breadcrumbs={breadcrumbs}
                            noteProjects={noteProjects}
                            projects={projects}
                            folderCounts={folderCounts}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Note view
    if (resolved.type === "note" && resolved.note) {
        const breadcrumbs = resolved.note.folderId
            ? await getFolderBreadcrumbs(resolved.note.folderId)
            : [];

        // Get project assignments for this note
        const noteProjectsMap = await getProjectsForItems("note", [resolved.note.id]);
        const initialProjectIds = (noteProjectsMap[resolved.note.id] ?? []).map((p) => p.id);

        return (
            <GenericNoteEditor
                note={resolved.note}
                breadcrumbs={breadcrumbs}
                projects={projects}
                initialProjectIds={initialProjectIds}
            />
        );
    }

    notFound();
}
