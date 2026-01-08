import { Skeleton } from "@/components/ui/skeleton";

export default function NotesPathLoading() {
    return (
        <div className="flex h-full flex-col">
            <div className="relative flex h-14 items-center border-b px-4">
                <Skeleton className="h-6 w-32" />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-5xl space-y-6">
                    {/* Breadcrumbs skeleton */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-24" />
                    </div>

                    {/* Actions skeleton */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-28" />
                        <Skeleton className="h-9 w-24" />
                    </div>

                    {/* Folders skeleton */}
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-16" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <Skeleton className="h-20 rounded-lg" />
                            <Skeleton className="h-20 rounded-lg" />
                        </div>
                    </div>

                    {/* Notes skeleton */}
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-12" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <Skeleton className="h-28 rounded-lg" />
                            <Skeleton className="h-28 rounded-lg" />
                            <Skeleton className="h-28 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
