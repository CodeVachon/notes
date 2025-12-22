import { getAllProjects } from "@/app/projects/actions";
import { ProjectsListClient } from "@/components/projects/projects-list-client";

export default async function ProjectsPage() {
    const projects = await getAllProjects();

    return (
        <div className="flex h-full flex-col">
            <div className="relative flex h-14 items-center border-b px-4">
                <h1 className="text-lg font-semibold">Projects</h1>
                <span className="text-muted-foreground ml-2 text-sm">
                    {projects.length} {projects.length === 1 ? "project" : "projects"}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-3xl">
                    <ProjectsListClient projects={projects} />
                </div>
            </div>
        </div>
    );
}
