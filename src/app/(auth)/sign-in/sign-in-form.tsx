"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { IconBrandGithub } from "@tabler/icons-react";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FieldError } from "@/components/ui/field";
import type { AuthConfig } from "@/lib/auth-config";

const ERROR_MESSAGES: Record<string, string> = {
    access_denied: "Access denied. You are not authorized to use this application.",
    forbidden: "Access denied. You are not authorized to use this application.",
    invalid_credentials: "Invalid email or password.",
    unknown: "An error occurred during sign in. Please try again."
};

interface SignInFormProps {
    config: Pick<AuthConfig, "githubEnabled" | "emailPasswordEnabled" | "signUpEnabled">;
}

export function SignInForm({ config }: SignInFormProps) {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isEmailLoading, setIsEmailLoading] = useState(false);
    const [isGitHubLoading, setIsGitHubLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isLoading = isEmailLoading || isGitHubLoading;

    const errorParam = searchParams.get("error");
    const urlError = errorParam
        ? ERROR_MESSAGES[errorParam.toLowerCase()] || ERROR_MESSAGES.unknown
        : null;

    const hasAnyAuthMethod = config.emailPasswordEnabled || config.githubEnabled;

    async function handleEmailSignIn(e: FormEvent) {
        e.preventDefault();
        setIsEmailLoading(true);
        setError(null);

        const { error } = await signIn.email({
            email,
            password,
            callbackURL: "/notebook"
        });

        if (error) {
            const errorKey = error.code?.toLowerCase() || "";
            setError(ERROR_MESSAGES[errorKey] || error.message || ERROR_MESSAGES.unknown);
            setIsEmailLoading(false);
        }
    }

    async function handleGitHubSignIn() {
        setIsGitHubLoading(true);
        setError(null);

        try {
            await signIn.social({
                provider: "github",
                callbackURL: "/notebook",
                errorCallbackURL: "/sign-in?error=access_denied"
            });
        } catch {
            setError("Failed to sign in. Please try again.");
            setIsGitHubLoading(false);
        }
    }

    if (!hasAnyAuthMethod) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Sign in unavailable</CardTitle>
                    <CardDescription>
                        Authentication is currently disabled for this application.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sign in</CardTitle>
                <CardDescription>Sign in to your account to continue</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {(urlError || error) && <FieldError>{urlError || error}</FieldError>}

                {config.emailPasswordEnabled && (
                    <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isEmailLoading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                )}

                {config.emailPasswordEnabled && config.githubEnabled && (
                    <div className="flex items-center gap-4">
                        <Separator className="flex-1" />
                        <span className="text-muted-foreground text-xs">or continue with</span>
                        <Separator className="flex-1" />
                    </div>
                )}

                {config.githubEnabled && (
                    <Button
                        variant="outline"
                        disabled={isLoading}
                        onClick={handleGitHubSignIn}
                        className="w-full"
                    >
                        <IconBrandGithub className="size-4" />
                        {isGitHubLoading ? "Redirecting to GitHub..." : "GitHub"}
                    </Button>
                )}

                {config.signUpEnabled && (
                    <p className="text-muted-foreground text-center text-xs">
                        {"Don't have an account? "}
                        <Link href="/sign-up" className="text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
