"use client";

import { useState } from "react";
import { IconBrandGithub } from "@tabler/icons-react";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";

export default function SignInPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleGitHubSignIn() {
        setIsLoading(true);
        setError(null);

        try {
            await signIn.social({
                provider: "github",
                callbackURL: "/notebook"
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
