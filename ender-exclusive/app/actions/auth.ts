"use server";

import { cookies } from "next/headers";

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  cookieStore.set("session", idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, 
  });
}


export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get("session")?.value ?? null;
}