export default function DailyPageLoading() {
    return (
        <div className="flex h-full flex-col">
            <div className="border-b p-4">
                <div className="flex items-center justify-between">
                    <div className="bg-muted size-8 animate-pulse rounded" />
                    <div className="space-y-1 text-center">
                        <div className="bg-muted h-6 w-48 animate-pulse rounded" />
                        <div className="bg-muted mx-auto h-3 w-12 animate-pulse rounded" />
                    </div>
                    <div className="bg-muted size-8 animate-pulse rounded" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-3xl space-y-8">
                    {/* Todos skeleton */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                            <div className="bg-muted h-7 w-24 animate-pulse rounded" />
                        </div>
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-muted h-16 animate-pulse rounded-lg" />
                            ))}
                        </div>
                    </div>

                    <div className="bg-border h-px" />

                    {/* Notes skeleton */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                            <div className="bg-muted h-7 w-24 animate-pulse rounded" />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-muted h-32 animate-pulse rounded-lg" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
