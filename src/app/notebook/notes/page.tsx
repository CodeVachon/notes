import type { Metadata } from "next";
import { FolderBrowser } from "@/components/notes/folder-browser";
import { getFolderContents, getFolderItemCounts } from "./actions";
import { getAllProjects, getProjectsForItems } from "@/app/projects/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Notes"
};

export default async function NotesRootPage() {
    // Get root folder contents
    const { folder, childFolders, notes } = await getFolderContents(null);

    // Get all projects for the editor
    const projects = await getAllProjects();

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
                <h1 className="text-lg font-semibold">Notes</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-5xl">
                    <FolderBrowser
                        folder={folder}
                        childFolders={childFolders}
                        notes={notes}
                        breadcrumbs={[]}
                        noteProjects={noteProjects}
                        projects={projects}
                        folderCounts={folderCounts}
                    />
                </div>
            </div>
        </div>
    );
}
