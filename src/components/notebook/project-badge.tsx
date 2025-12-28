import Link from "next/link";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { Project, ProjectColor } from "@/db/schema";

const projectBadgeVariants = cva(
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.625rem] font-medium border",
    {
        variants: {
            color: {
                red: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
                orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
                yellow: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
                green: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
                blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
                pink: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
                gray: "bg-muted text-muted-foreground border-border"
            }
        },
        defaultVariants: {
            color: "blue"
        }
    }
);

interface ProjectBadgeProps {
    project: Pick<Project, "id" | "name" | "color" | "emoji">;
    asLink?: boolean;
    className?: string;
}

function ProjectBadge({ project, asLink = false, className }: ProjectBadgeProps) {
    const content = (
        <>
            {project.emoji && <span>{project.emoji}</span>}
            <span>{project.name}</span>
        </>
    );

    if (asLink) {
        return (
            <Link
                href={`/projects/${project.id}`}
                className={cn(
                    projectBadgeVariants({ color: project.color as ProjectColor }),
                    "transition-opacity hover:opacity-80",
                    className
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {content}
            </Link>
        );
    }

    return (
        <span
            className={cn(
                projectBadgeVariants({ color: project.color as ProjectColor }),
                className
            )}
        >
            {content}
        </span>
    );
}

export { ProjectBadge, projectBadgeVariants };
