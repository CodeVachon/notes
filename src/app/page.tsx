import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
    return (
        <div className="flex h-screen items-center justify-center">
            <Card>
                <CardContent>
                    <p className="text-2xl font-bold">Notes</p>
                </CardContent>
            </Card>
        </div>
    );
}
