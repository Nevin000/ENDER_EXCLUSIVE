"use client";

import { auth } from "@/firebase/config";

export default function TestPage() {
  console.log(auth);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">Firebase Connected ✅</h1>
    </div>
  );
}

