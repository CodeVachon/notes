import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconTag } from "@tabler/icons-react";
import { getTagMentions } from "@/app/tags/actions";
import { Button } from "@/components/ui/button";
import { TagMentionsClient } from "@/components/tags/tag-mentions-client";

interface TagPageProps {
    params: Promise<{ tagname: string }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
    const { tagname } = await params;
    const decodedTagname = decodeURIComponent(tagname);
    return {
        title: `Notes - Tag: ${decodedTagname}`
    };
}

export default async function TagPage({ params }: TagPageProps) {
    const { tagname } = await params;
    const decodedTagname = decodeURIComponent(tagname);
    const data = await getTagMentions(decodedTagname);

    if (!data) {
        notFound();
    }

    const totalMentions = data.notes.length + data.todos.length;

    return (
        <div className="flex h-full flex-col">
            <div className="relative flex h-14 items-center gap-2 border-b px-4">
                <Link href="/tags">
                    <Button variant="ghost" size="icon-xs">
                        <IconArrowLeft className="size-4" />
                    </Button>
                </Link>
                <h1 className="text-lg font-semibold">{decodedTagname}</h1>
                <span className="text-muted-foreground text-sm">
                    {totalMentions} {totalMentions === 1 ? "mention" : "mentions"}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-3xl">
                    {totalMentions === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                            <IconTag className="text-muted-foreground size-8" />
                            <p className="text-muted-foreground text-sm">
                                No mentions found for this tag.
                            </p>
                        </div>
                    ) : (
                        <TagMentionsClient
                            notes={data.notes}
                            todos={data.todos}
                            noteComments={data.noteComments}
                            todoComments={data.todoComments}
                            dates={data.dates}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
