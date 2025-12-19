"use client";

import { useState, useTransition, useOptimistic, useEffect } from "react";
import {
    IconChevronDown,
    IconMessage,
    IconTrash,
    IconPencil,
    IconPlus
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent
} from "@/components/ui/collapsible";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { RichTextEditor } from "./rich-text-editor";
import { HtmlContent } from "./html-content";
import { createComment, updateComment, deleteComment } from "@/app/notebook/actions";
import { cn } from "@/lib/utils";
import type { Comment } from "@/db/schema";

interface CommentSectionProps {
    comments: Comment[];
    todoId?: string;
    noteId?: string;
}

function CommentForm({
    todoId,
    noteId,
    comment,
    onOpenChange,
    onOptimisticAdd,
    onOptimisticUpdate
}: {
    todoId?: string;
    noteId?: string;
    comment?: Comment;
    onOpenChange: (open: boolean) => void;
    onOptimisticAdd?: (comment: Comment) => void;
    onOptimisticUpdate?: (comment: Comment) => void;
}) {
    const [isPending, startTransition] = useTransition();
    const [content, setContent] = useState(comment?.content ?? "");
    const isEditing = !!comment;

    const isEmptyContent = (html: string) => {
        const stripped = html.replace(/<[^>]*>/g, "").trim();
        return stripped === "";
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEmptyContent(content)) return;

        startTransition(async () => {
            if (isEditing && comment) {
                const updated: Comment = {
                    ...comment,
                    content,
                    updatedAt: new Date()
                };
                onOptimisticUpdate?.(updated);
                await updateComment(comment.id, { content });
            } else {
                const tempId = `temp-${Date.now()}`;
                const tempComment: Comment = {
                    id: tempId,
                    userId: "",
                    todoId: todoId ?? null,
                    noteId: noteId ?? null,
                    content,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                onOptimisticAdd?.(tempComment);
                await createComment({ content, todoId, noteId });
            }
            onOpenChange(false);
        });
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Write your comment..."
                compact
            />
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button type="submit" disabled={isPending || isEmptyContent(content)}>
                    {isPending ? "Saving..." : isEditing ? "Save Changes" : "Add Comment"}
                </Button>
            </AlertDialogFooter>
        </form>
    );
}

export function CommentSection({ comments: initialComments, todoId, noteId }: CommentSectionProps) {
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [editingComment, setEditingComment] = useState<Comment | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [optimisticComments, addOptimisticComment] = useOptimistic(
        initialComments,
        (state, action: { type: "add" | "delete" | "update"; comment?: Comment; id?: string }) => {
            if (action.type === "add" && action.comment) {
                return [...state, action.comment];
            }
            if (action.type === "delete" && action.id) {
                return state.filter((c) => c.id !== action.id);
            }
            if (action.type === "update" && action.comment) {
                return state.map((c) => (c.id === action.comment!.id ? action.comment! : c));
            }
            return state;
        }
    );

    const handleDelete = (commentId: string) => {
        startTransition(async () => {
            addOptimisticComment({ type: "delete", id: commentId });
            await deleteComment(commentId);
        });
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    };

    // Render a static placeholder during SSR to avoid hydration mismatch
    if (!mounted) {
        if (initialComments.length === 0) {
            return (
                <div className="mt-2">
                    <Button variant="ghost" size="xs" disabled className="text-muted-foreground">
                        <IconPlus className="size-3" />
                        Add Comment
                    </Button>
                </div>
            );
        }
        return (
            <div className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
                <IconMessage className="size-3.5" />
                <span>
                    {initialComments.length}{" "}
                    {initialComments.length === 1 ? "comment" : "comments"}
                </span>
                <IconChevronDown className="size-3.5" />
            </div>
        );
    }

    const addCommentDialog = (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger
                render={
                    <Button variant="ghost" size="xs" className="text-muted-foreground">
                        <IconPlus className="size-3" />
                        Add Comment
                    </Button>
                }
            />
            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle>Add Comment</AlertDialogTitle>
                </AlertDialogHeader>
                <CommentForm
                    key="new"
                    todoId={todoId}
                    noteId={noteId}
                    onOpenChange={setIsDialogOpen}
                    onOptimisticAdd={(comment) => addOptimisticComment({ type: "add", comment })}
                />
            </AlertDialogContent>
        </AlertDialog>
    );

    const editCommentDialog = editingComment && (
        <AlertDialog
            open={!!editingComment}
            onOpenChange={(open) => {
                if (!open) setEditingComment(null);
            }}
        >
            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit Comment</AlertDialogTitle>
                </AlertDialogHeader>
                <CommentForm
                    key={editingComment.id}
                    todoId={todoId}
                    noteId={noteId}
                    comment={editingComment}
                    onOpenChange={(open) => {
                        if (!open) setEditingComment(null);
                    }}
                    onOptimisticUpdate={(comment) =>
                        addOptimisticComment({ type: "update", comment })
                    }
                />
            </AlertDialogContent>
        </AlertDialog>
    );

    // No comments - just show add button
    if (optimisticComments.length === 0) {
        return (
            <div className="mt-2">
                {addCommentDialog}
                {editCommentDialog}
            </div>
        );
    }

    // Has comments - show collapsible section
    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
            <CollapsibleTrigger
                className={cn(
                    "text-muted-foreground hover:text-foreground flex w-full items-center gap-1.5 text-xs transition-colors",
                    isPending && "pointer-events-none opacity-50"
                )}
            >
                <IconMessage className="size-3.5" />
                <span>
                    {optimisticComments.length}{" "}
                    {optimisticComments.length === 1 ? "comment" : "comments"}
                </span>
                <IconChevronDown
                    className={cn(
                        "size-3.5 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-2 space-y-3">
                <div className="space-y-3">
                    {optimisticComments.map((comment) => (
                        <div
                            key={comment.id}
                            className="bg-muted/50 group rounded-md p-2 text-sm"
                        >
                            <HtmlContent
                                content={comment.content}
                                className="text-sm [&_pre]:my-1 [&_pre]:p-2 [&_pre]:text-xs"
                            />
                            <div className="mt-1 flex items-center justify-between">
                                <span className="text-muted-foreground text-xs">
                                    {formatDate(comment.createdAt)}
                                </span>
                                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() => setEditingComment(comment)}
                                    >
                                        <IconPencil className="size-3" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() => handleDelete(comment.id)}
                                    >
                                        <IconTrash className="size-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {addCommentDialog}
                {editCommentDialog}
            </CollapsibleContent>
        </Collapsible>
    );
}
