import type { Metadata } from "next";
import { getAllTags } from "@/app/tags/actions";
import { TagsListClient } from "@/components/tags/tags-list-client";

export const metadata: Metadata = {
    title: "Notes - Tags"
};

export default async function TagsPage() {
    const tags = await getAllTags();

    return (
        <div className="flex h-full flex-col">
            <div className="relative flex h-14 items-center border-b px-4">
                <h1 className="text-lg font-semibold">Tags</h1>
                <span className="text-muted-foreground ml-2 text-sm">
                    {tags.length} {tags.length === 1 ? "tag" : "tags"}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-3xl">
                    <TagsListClient tags={tags} />
                </div>
            </div>
        </div>
    );
}
