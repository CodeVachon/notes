"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { IconLogout, IconChevronUp } from "@tabler/icons-react";

import { signOut } from "@/lib/auth-client";
import { useMounted } from "@/lib/use-mounted";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
    user: {
        name: string;
        email: string;
        image?: string | null;
    };
}

export function UserMenu({ user }: UserMenuProps) {
    const router = useRouter();
    const mounted = useMounted();

    const handleSignOut = async () => {
        await signOut();
        router.push("/sign-in");
    };

    // Render placeholder during SSR to avoid hydration mismatch
    // Base UI generates different IDs on server vs client
    if (!mounted) {
        return (
            <div className="flex w-full items-center gap-3 rounded-lg p-2">
                <div className="bg-muted flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full">
                    <span className="text-xs font-medium">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="text-muted-foreground truncate text-xs">{user.email}</p>
                </div>
                <IconChevronUp className="text-muted-foreground size-4" />
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="hover:bg-accent flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors outline-none">
                <div className="bg-muted flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full">
                    {user.image ? (
                        <Image
                            src={user.image}
                            alt={user.name}
                            width={32}
                            height={32}
                            className="size-full object-cover"
                        />
                    ) : (
                        <span className="text-xs font-medium">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="text-muted-foreground truncate text-xs">{user.email}</p>
                </div>
                <IconChevronUp className="text-muted-foreground size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                    <IconLogout />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
