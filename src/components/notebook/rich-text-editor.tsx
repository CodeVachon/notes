"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Extension, textblockTypeInputRule, markInputRule } from "@tiptap/core";
import { common, createLowlight } from "lowlight";

// Custom extension to add markdown shortcuts for code blocks
const MarkdownCodeShortcuts = Extension.create({
    name: "markdownCodeShortcuts",

    addInputRules() {
        // Get the codeBlock node type from the schema
        const codeBlockType = this.editor.schema.nodes.codeBlock;
        const codeMarkType = this.editor.schema.marks.code;

        const rules = [];

        // Triple backticks with optional language: ```js, ```sql, ```
        if (codeBlockType) {
            rules.push(
                textblockTypeInputRule({
                    find: /^```([a-zA-Z0-9_-]*)[\s\n]$/,
                    type: codeBlockType,
                    getAttributes: (match) => ({
                        language: match[1] || "sql"
                    })
                })
            );
        }

        // Inline code with single backticks: `text`
        if (codeMarkType) {
            rules.push(
                markInputRule({
                    find: /(?:^|[^`])(`([^`]+)`)$/,
                    type: codeMarkType
                })
            );
        }

        return rules;
    },

    addKeyboardShortcuts() {
        return {
            // Exit code block with triple backticks by pressing Enter on a line with just ```
            Enter: ({ editor }) => {
                if (!editor.isActive("codeBlock")) {
                    return false;
                }

                const { state } = editor;
                const { selection } = state;
                const { $from } = selection;

                // Get the current line text
                const lineStart = $from.start();
                const lineText = state.doc.textBetween(lineStart, $from.pos, "\n");

                // Check if the current line is just ``` (to exit code block)
                if (lineText.trim() === "```") {
                    // Delete the ``` and exit the code block
                    editor
                        .chain()
                        .focus()
                        .command(({ tr }) => {
                            // Delete from start of the ``` to current position
                            const deleteFrom = $from.pos - lineText.length;
                            tr.delete(deleteFrom, $from.pos);
                            return true;
                        })
                        .exitCode()
                        .run();
                    return true;
                }

                return false;
            }
        };
    }
});
import {
    IconBold,
    IconItalic,
    IconUnderline,
    IconStrikethrough,
    IconH1,
    IconH2,
    IconH3,
    IconList,
    IconListNumbers,
    IconLink,
    IconCode,
    IconCodeDots
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Create lowlight instance with common languages (includes js, ts, bash, json, sql, yaml)
const lowlight = createLowlight(common);

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
    compact?: boolean;
}

export function RichTextEditor({
    content,
    onChange,
    placeholder = "Start writing...",
    className,
    compact = false
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: compact ? false : { levels: [1, 2, 3] },
                codeBlock: false // Disable default, use CodeBlockLowlight instead
            }),
            CodeBlockLowlight.configure({
                lowlight,
                defaultLanguage: "sql"
            }),
            MarkdownCodeShortcuts,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-primary underline underline-offset-2"
                }
            }),
            Placeholder.configure({
                placeholder
            })
        ],
        content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-sm dark:prose-invert max-w-none focus:outline-none px-3 py-2",
                    compact ? "min-h-[60px]" : "min-h-[200px]"
                )
            }
        }
    });

    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL", previousUrl);

        if (url === null) return;

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    return (
        <div className={cn("rounded-lg border", className)}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 border-b p-1">
                <Button
                    type="button"
                    variant={editor.isActive("bold") ? "secondary" : "ghost"}
                    size="icon-xs"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <IconBold className="size-3.5" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive("italic") ? "secondary" : "ghost"}
                    size="icon-xs"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <IconItalic className="size-3.5" />
                </Button>
                {!compact && (
                    <>
                        <Button
                            type="button"
                            variant={editor.isActive("underline") ? "secondary" : "ghost"}
                            size="icon-xs"
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                        >
                            <IconUnderline className="size-3.5" />
                        </Button>
                        <Button
                            type="button"
                            variant={editor.isActive("strike") ? "secondary" : "ghost"}
                            size="icon-xs"
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                        >
                            <IconStrikethrough className="size-3.5" />
                        </Button>

                        <Separator orientation="vertical" className="mx-1 h-4" />

                        <Button
                            type="button"
                            variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"}
                            size="icon-xs"
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        >
                            <IconH1 className="size-3.5" />
                        </Button>
                        <Button
                            type="button"
                            variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
                            size="icon-xs"
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        >
                            <IconH2 className="size-3.5" />
                        </Button>
                        <Button
                            type="button"
                            variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
                            size="icon-xs"
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        >
                            <IconH3 className="size-3.5" />
                        </Button>
                    </>
                )}

                <Separator orientation="vertical" className="mx-1 h-4" />

                <Button
                    type="button"
                    variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
                    size="icon-xs"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <IconList className="size-3.5" />
                </Button>
                {!compact && (
                    <Button
                        type="button"
                        variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
                        size="icon-xs"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    >
                        <IconListNumbers className="size-3.5" />
                    </Button>
                )}

                <Separator orientation="vertical" className="mx-1 h-4" />

                <Button
                    type="button"
                    variant={editor.isActive("code") ? "secondary" : "ghost"}
                    size="icon-xs"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    title="Inline Code"
                >
                    <IconCode className="size-3.5" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive("codeBlock") ? "secondary" : "ghost"}
                    size="icon-xs"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    title="Code Block (SQL default)"
                >
                    <IconCodeDots className="size-3.5" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive("link") ? "secondary" : "ghost"}
                    size="icon-xs"
                    onClick={setLink}
                    title="Link"
                >
                    <IconLink className="size-3.5" />
                </Button>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} />
        </div>
    );
}
