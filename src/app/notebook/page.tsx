import { redirect } from "next/navigation";
import { getTodayString } from "@/lib/date-utils";

export default function NotebookPage() {
    redirect(`/notebook/${getTodayString()}`);
}
