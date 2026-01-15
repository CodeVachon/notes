import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth-config";
import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
    if (!authConfig.signInEnabled) {
        redirect("/");
    }

    return (
        <SignInForm
            config={{
                githubEnabled: authConfig.githubEnabled,
                emailPasswordEnabled: authConfig.emailPasswordEnabled,
                signUpEnabled: authConfig.signUpEnabled
            }}
        />
    );
}
