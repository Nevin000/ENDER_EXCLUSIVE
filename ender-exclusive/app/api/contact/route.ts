import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "enderexclusive@gmail.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "Ender Exclusive <orders@enderexclusive.com>";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    let firestoreSaved = false;
    let docId = "";

    try {
      const docRef = await addDoc(collection(db, "contact_messages"), {
        name: String(name).trim(),
        email: String(email).trim(),
        phone: phone ? String(phone).trim() : "",
        subject: subject ? String(subject).trim() : "General Inquiry",
        message: String(message).trim(),
        status: "unread",
        createdAt: Timestamp.now(),
        createdAtIso: new Date().toISOString(),
      });
      docId = docRef.id;
      firestoreSaved = true;
    } catch (fsErr) {
      console.warn("[Contact API] Firestore save warning:", fsErr);
    }

    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: [ADMIN_EMAIL],
          subject: `📩 New Contact Form: ${subject || "Inquiry"} - ${name}`,
          html: `
            <h2>New Contact Inquiry Received</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || "N/A"}</p>
            <p><strong>Subject:</strong> ${subject || "General Inquiry"}</p>
            <hr />
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-line;">${message}</p>
          `,
        });
      } catch (emailErr) {
        console.warn("[Contact API] Email notification warning:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      id: docId || "msg-" + Date.now(),
      firestoreSaved,
    });
  } catch (error: any) {
    console.error("Error in contact API route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit contact message." },
      { status: 500 }
    );
  }
}
