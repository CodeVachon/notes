import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth-config";
import { SignUpForm } from "./sign-up-form";

export default function SignUpPage() {
    // Sign-up requires both signUpEnabled AND emailPasswordEnabled
    // (sign-up is only for email/password accounts, not OAuth)
    if (!authConfig.signUpEnabled || !authConfig.emailPasswordEnabled) {
        redirect("/");
    }

    return (
        <SignUpForm
            config={{
                signInEnabled: authConfig.signInEnabled
            }}
        />
    );
}
