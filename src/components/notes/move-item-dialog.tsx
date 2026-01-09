"use client";

import { useState, useEffect, useTransition } from "react";
import { IconFolder, IconFolderOpen, IconChevronRight, IconHome } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { getAllFolders, moveFolder, moveGenericNote } from "@/app/notebook/notes/actions";
import { cn } from "@/lib/utils";
import type { NoteFolder } from "@/db/schema";

interface MoveItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itemId: string;
    itemType: "folder" | "note";
    itemName: string;
    currentFolderId: string | null;
}

interface FolderTreeNode {
    folder: NoteFolder;
    children: FolderTreeNode[];
}

function buildFolderTree(folders: NoteFolder[], excludeId?: string): FolderTreeNode[] {
    // Filter out the item being moved (if it's a folder) and its descendants
    const filteredFolders = excludeId
        ? folders.filter((f) => {
              // Exclude the folder itself
              if (f.id === excludeId) return false;
              // Check if this folder is a descendant of excludeId
              let parentId = f.parentId;
              while (parentId) {
                  if (parentId === excludeId) return false;
                  const parent = folders.find((p) => p.id === parentId);
                  parentId = parent?.parentId ?? null;
              }
              return true;
          })
        : folders;

    const folderMap = new Map<string | null, FolderTreeNode[]>();

    // Group folders by parent
    for (const folder of filteredFolders) {
        const parentId = folder.parentId;
        if (!folderMap.has(parentId)) {
            folderMap.set(parentId, []);
        }
        folderMap.get(parentId)!.push({ folder, children: [] });
    }

    // Build tree recursively
    function attachChildren(nodes: FolderTreeNode[]): FolderTreeNode[] {
        for (const node of nodes) {
            const children = folderMap.get(node.folder.id) ?? [];
            node.children = attachChildren(children);
        }
        return nodes.sort((a, b) => a.folder.name.localeCompare(b.folder.name));
    }

    const rootNodes = folderMap.get(null) ?? [];
    return attachChildren(rootNodes);
}

function FolderTreeItem({
    node,
    level,
    selectedId,
    onSelect,
    currentFolderId
}: {
    node: FolderTreeNode;
    level: number;
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    currentFolderId: string | null;
}) {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children.length > 0;
    const isSelected = selectedId === node.folder.id;
    const isCurrent = currentFolderId === node.folder.id;

    return (
        <div>
            <button
                type="button"
                className={cn(
                    "flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                    isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    isCurrent && !isSelected && "text-muted-foreground"
                )}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={() => onSelect(node.folder.id)}
                disabled={isCurrent}
            >
                {hasChildren ? (
                    <span
                        role="button"
                        tabIndex={0}
                        className="hover:bg-muted-foreground/20 -ml-1 rounded p-0.5"
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(!expanded);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                setExpanded(!expanded);
                            }
                        }}
                    >
                        <IconChevronRight
                            className={cn("size-3.5 transition-transform", expanded && "rotate-90")}
                        />
                    </span>
                ) : (
                    <span className="w-4" />
                )}
                {expanded && hasChildren ? (
                    <IconFolderOpen className="size-4 shrink-0" />
                ) : (
                    <IconFolder className="size-4 shrink-0" />
                )}
                <span className="truncate">{node.folder.name}</span>
                {isCurrent && (
                    <span className="text-muted-foreground ml-auto text-xs">(current)</span>
                )}
            </button>
            {expanded && hasChildren && (
                <div>
                    {node.children.map((child) => (
                        <FolderTreeItem
                            key={child.folder.id}
                            node={child}
                            level={level + 1}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            currentFolderId={currentFolderId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function MoveItemDialog({
    open,
    onOpenChange,
    itemId,
    itemType,
    itemName,
    currentFolderId
}: MoveItemDialogProps) {
    const [folders, setFolders] = useState<NoteFolder[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null | undefined>(undefined);
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load folders when dialog opens
    useEffect(() => {
        if (open) {
            setIsLoading(true);
            setError(null);
            setSelectedFolderId(undefined);
            getAllFolders()
                .then(setFolders)
                .catch(() => setError("Failed to load folders"))
                .finally(() => setIsLoading(false));
        }
    }, [open]);

    const folderTree = buildFolderTree(folders, itemType === "folder" ? itemId : undefined);

    const isRootSelected = selectedFolderId === null;
    const isCurrentRoot = currentFolderId === null;
    const hasSelection = selectedFolderId !== undefined;
    const canMove = hasSelection && selectedFolderId !== currentFolderId;

    const handleMove = () => {
        if (!canMove) return;

        setError(null);
        startTransition(async () => {
            try {
                if (itemType === "folder") {
                    await moveFolder(itemId, selectedFolderId ?? null);
                } else {
                    await moveGenericNote(itemId, selectedFolderId ?? null);
                }
                onOpenChange(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to move item");
            }
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>Move &quot;{itemName}&quot;</AlertDialogTitle>
                </AlertDialogHeader>

                <div className="py-2">
                    <p className="text-muted-foreground mb-3 text-sm">
                        Select a destination folder:
                    </p>

                    {isLoading ? (
                        <div className="text-muted-foreground py-8 text-center text-sm">
                            Loading folders...
                        </div>
                    ) : (
                        <div className="max-h-64 overflow-y-auto rounded-md border p-2">
                            {/* Root option */}
                            <button
                                type="button"
                                className={cn(
                                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                                    isRootSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted",
                                    isCurrentRoot && !isRootSelected && "text-muted-foreground"
                                )}
                                onClick={() => setSelectedFolderId(null)}
                                disabled={isCurrentRoot}
                            >
                                <IconHome className="size-4" />
                                <span>Notes (root)</span>
                                {isCurrentRoot && (
                                    <span className="text-muted-foreground ml-auto text-xs">
                                        (current)
                                    </span>
                                )}
                            </button>

                            {/* Folder tree */}
                            {folderTree.map((node) => (
                                <FolderTreeItem
                                    key={node.folder.id}
                                    node={node}
                                    level={1}
                                    selectedId={selectedFolderId ?? null}
                                    onSelect={setSelectedFolderId}
                                    currentFolderId={currentFolderId}
                                />
                            ))}

                            {folderTree.length === 0 && !isLoading && (
                                <p className="text-muted-foreground py-4 text-center text-sm">
                                    No other folders available
                                </p>
                            )}
                        </div>
                    )}

                    {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button onClick={handleMove} disabled={isPending || !canMove}>
                        {isPending ? "Moving..." : "Move"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
