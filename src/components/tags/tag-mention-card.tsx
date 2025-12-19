"use client";

import Link from "next/link";
import { IconNote, IconCheckbox, IconMessage } from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TagMentionResult } from "@/app/tags/actions";

interface TagMentionCardProps {
    mention: TagMentionResult;
}

const typeConfig = {
    note: {
        label: "Note",
        icon: IconNote,
        variant: "secondary" as const
    },
    todo: {
        label: "Todo",
        icon: IconCheckbox,
        variant: "outline" as const
    },
    comment: {
        label: "Comment",
        icon: IconMessage,
        variant: "outline" as const
    }
};

export function TagMentionCard({ mention }: TagMentionCardProps) {
    const config = typeConfig[mention.type];
    const Icon = config.icon;

    const formattedDate = mention.date
        ? new Date(mention.date + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric"
          })
        : "Unknown date";

    return (
        <Link href={`/notebook/${mention.date}`}>
            <Card size="sm" className="hover:ring-primary/20 transition-all hover:ring-2">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Badge variant={config.variant} className="gap-1">
                            <Icon className="size-3" />
                            <span>{config.label}</span>
                        </Badge>
                        {mention.title && (
                            <CardTitle className="line-clamp-1 text-sm">{mention.title}</CardTitle>
                        )}
                    </div>
                    <CardDescription>{formattedDate}</CardDescription>
                </CardHeader>
                {mention.contentSnippet && (
                    <CardContent>
                        <p className="text-muted-foreground line-clamp-3 text-sm">
                            {mention.contentSnippet}
                        </p>
                    </CardContent>
                )}
            </Card>
        </Link>
    );
}
