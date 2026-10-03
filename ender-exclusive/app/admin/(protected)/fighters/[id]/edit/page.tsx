import { redirect } from "next/navigation";

export default function EditFighterRedirect() {
  redirect("/admin/fighters");
}
