import { redirect } from "next/navigation";

export default function NewFighterRedirect() {
  redirect("/admin/fighters");
}
