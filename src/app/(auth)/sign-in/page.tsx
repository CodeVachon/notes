"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { IconBrandGithub } from "@tabler/icons-react";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";

const ERROR_MESSAGES: Record<string, string> = {
    access_denied: "Access denied. You are not authorized to use this application.",
    forbidden: "Access denied. You are not authorized to use this application.",
    unknown: "An error occurred during sign in. Please try again."
};

export default function SignInPage() {
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const errorParam = searchParams.get("error");
        if (errorParam) {
            const errorKey = errorParam.toLowerCase();
            setError(ERROR_MESSAGES[errorKey] || ERROR_MESSAGES.unknown);
        }
    }, [searchParams]);

    async function handleGitHubSignIn() {
        setIsLoading(true);
        setError(null);

        try {
            await signIn.social({
                provider: "github",
                callbackURL: "/notebook",
                errorCallbackURL: "/sign-in?error=access_denied"
            });
        } catch {
            setError("Failed to sign in. Please try again.");
            setIsLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sign in</CardTitle>
                <CardDescription>Sign in with your GitHub account to continue</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {error && <FieldError>{error}</FieldError>}

                <Button
                    variant="outline"
                    disabled={isLoading}
                    onClick={handleGitHubSignIn}
                    className="w-full"
                >
                    <IconBrandGithub className="size-4" />
                    {isLoading ? "Redirecting to GitHub..." : "Continue with GitHub"}
                </Button>

                <p className="text-muted-foreground text-center text-xs">
                    This application is private.
                </p>
            </CardContent>
        </Card>
    );
}
