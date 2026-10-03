// app/admin/(protected)/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "@/components/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) {
        redirect("/admin/login");
    }

    return <AdminShell>{children}</AdminShell>;
}