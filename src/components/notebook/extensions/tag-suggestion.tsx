"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { cn } from "@/lib/utils";
import { getTagSuggestions } from "@/app/tags/actions";

// Plugin key for the tag suggestion plugin
export const tagSuggestionPluginKey = new PluginKey("tagSuggestion");

export interface TagSuggestionState {
    active: boolean;
    query: string;
    from: number;
    to: number;
}

// Create the tag suggestion extension
export function createTagSuggestionExtension(
    onStateChange: (state: TagSuggestionState | null) => void
) {
    return Extension.create({
        name: "tagSuggestion",

        addProseMirrorPlugins() {
            return [
                new Plugin({
                    key: tagSuggestionPluginKey,

                    state: {
                        init() {
                            return { active: false, query: "", from: 0, to: 0 };
                        },

                        apply(tr, _prev) {
                            const { selection } = tr;
                            const { $from } = selection;

                            // Get text before cursor in current text block
                            const textBefore = $from.parent.textBetween(
                                0,
                                $from.parentOffset,
                                undefined,
                                "\ufffc"
                            );

                            // Check if we're inside a tag pattern [[...
                            const match = textBefore.match(/\[\[([a-zA-Z0-9]*)$/);

                            if (match) {
                                const query = match[1];
                                const from = $from.pos - match[0].length;
                                const to = $from.pos;

                                return {
                                    active: true,
                                    query,
                                    from,
                                    to
                                };
                            }

                            return { active: false, query: "", from: 0, to: 0 };
                        }
                    },

                    view() {
                        return {
                            update(view) {
                                const state = tagSuggestionPluginKey.getState(view.state);
                                if (state?.active) {
                                    onStateChange(state);
                                } else {
                                    onStateChange(null);
                                }
                            }
                        };
                    }
                })
            ];
        }
    });
}

// Tag suggestion popup component
interface TagSuggestionPopupProps {
    query: string;
    onSelect: (tagName: string) => void;
    onClose: () => void;
}

interface TagSuggestion {
    id: string;
    name: string;
    mentionCount?: number;
}

export function TagSuggestionPopup({ query, onSelect, onClose }: TagSuggestionPopupProps) {
    const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Show "Create tag" option if query doesn't match existing
    const showCreateOption =
        query.length > 0 && !suggestions.some((s) => s.name.toLowerCase() === query.toLowerCase());

    const totalOptions = suggestions.length + (showCreateOption ? 1 : 0);

    // Fetch suggestions when query changes
    useEffect(() => {
        let cancelled = false;

        const fetchSuggestions = async () => {
            setLoading(true);
            try {
                const results = await getTagSuggestions(query);
                if (!cancelled) {
                    setSuggestions(results);
                    setSelectedIndex(0);
                }
            } catch {
                if (!cancelled) {
                    setSuggestions([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchSuggestions();

        return () => {
            cancelled = true;
        };
    }, [query]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % totalOptions);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + totalOptions) % totalOptions);
            } else if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                if (showCreateOption && selectedIndex === suggestions.length) {
                    // Create new tag
                    onSelect(query.toLowerCase());
                } else if (suggestions[selectedIndex]) {
                    onSelect(suggestions[selectedIndex].name);
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            }
        },
        [totalOptions, selectedIndex, suggestions, showCreateOption, query, onSelect, onClose]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown, true);
        return () => {
            document.removeEventListener("keydown", handleKeyDown, true);
        };
    }, [handleKeyDown]);

    return (
        <div
            ref={containerRef}
            className="bg-popover text-popover-foreground absolute z-50 w-56 overflow-hidden rounded-md border shadow-lg"
            style={{ top: "100%", left: 0, marginTop: 4 }}
        >
            {loading && suggestions.length === 0 ? (
                <div className="text-muted-foreground px-3 py-2 text-sm">Loading...</div>
            ) : suggestions.length === 0 && !showCreateOption ? (
                <div className="text-muted-foreground px-3 py-2 text-sm">
                    Type to create a new tag
                </div>
            ) : (
                <div className="max-h-48 overflow-y-auto py-1">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={suggestion.id}
                            className={cn(
                                "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm",
                                index === selectedIndex && "bg-accent"
                            )}
                            onClick={() => onSelect(suggestion.name)}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <span className="flex-1">[[{suggestion.name}]]</span>
                            {suggestion.mentionCount !== undefined && (
                                <span className="text-muted-foreground text-xs">
                                    {suggestion.mentionCount}
                                </span>
                            )}
                        </button>
                    ))}
                    {showCreateOption && (
                        <button
                            className={cn(
                                "flex w-full items-center gap-2 border-t px-3 py-1.5 text-left text-sm",
                                selectedIndex === suggestions.length && "bg-accent"
                            )}
                            onClick={() => onSelect(query.toLowerCase())}
                            onMouseEnter={() => setSelectedIndex(suggestions.length)}
                        >
                            <span className="text-muted-foreground">Create</span>
                            <span>[[{query.toLowerCase()}]]</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
