import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { TodoPriority } from "@/db/schema";

const priorityBadgeVariants = cva(
    "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[0.625rem] font-medium",
    {
        variants: {
            priority: {
                high: "bg-destructive/10 text-destructive border border-destructive/20",
                medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20",
                low: "bg-muted text-muted-foreground border border-border"
            }
        },
        defaultVariants: {
            priority: "medium"
        }
    }
);

interface PriorityBadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof priorityBadgeVariants> {
    priority: TodoPriority;
}

function PriorityBadge({ priority, className, ...props }: PriorityBadgeProps) {
    return (
        <span className={cn(priorityBadgeVariants({ priority, className }))} {...props}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </span>
    );
}

export { PriorityBadge, priorityBadgeVariants };
