import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Resend } from "resend";

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || "enderexclusive@gmail.com";

const FROM_EMAIL =
  process.env.FROM_EMAIL ||
  "Ender Exclusive <orders@enderexclusive.com>";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        {
          error: "Name, email, and message are required.",
        },
        { status: 400 }
      );
    }

    let firestoreSaved = false;
    let docId = "";

    // -----------------------------------------
    // 1. Save contact message to Firestore
    // -----------------------------------------
    try {
      const docRef = await addDoc(collection(db, "contact_messages"), {
        name: String(name).trim(),
        email: String(email).trim(),
        phone: phone ? String(phone).trim() : "",
        subject: subject
          ? String(subject).trim()
          : "General Inquiry",
        message: String(message).trim(),
        status: "unread",
        createdAt: Timestamp.now(),
        createdAtIso: new Date().toISOString(),
      });

      docId = docRef.id;
      firestoreSaved = true;
    } catch (fsErr) {
      console.warn(
        "[Contact API] Firestore save warning:",
        fsErr
      );
    }

    // -----------------------------------------
    // 2. Send email through Resend
    // -----------------------------------------

    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      try {
        // IMPORTANT:
        // Create Resend only after checking the API key.
        const resend = new Resend(resendApiKey);

        await resend.emails.send({
          from: FROM_EMAIL,
          to: [ADMIN_EMAIL],
          subject: `📩 New Contact Form: ${
            subject || "Inquiry"
          } - ${name}`,

          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
              
              <h2 style="color: #111;">
                New Contact Inquiry Received
              </h2>

              <p>
                <strong>Name:</strong>
                ${String(name)}
              </p>

              <p>
                <strong>Email:</strong>
                ${String(email)}
              </p>

              <p>
                <strong>Phone:</strong>
                ${phone ? String(phone) : "N/A"}
              </p>

              <p>
                <strong>Subject:</strong>
                ${subject || "General Inquiry"}
              </p>

              <hr />

              <p>
                <strong>Message:</strong>
              </p>

              <p style="white-space: pre-line;">
                ${String(message)}
              </p>

              <hr />

              <p style="color: #777; font-size: 12px;">
                ENDER EXCLUSIVE — Contact Form
              </p>

            </div>
          `,
        });

        console.log("[Contact API] Email sent successfully.");
      } catch (emailErr) {
        console.warn(
          "[Contact API] Email notification warning:",
          emailErr
        );
      }
    } else {
      console.warn(
        "[Contact API] RESEND_API_KEY is not configured."
      );
    }

    // -----------------------------------------
    // 3. Return success response
    // -----------------------------------------

    return NextResponse.json({
      success: true,
      id: docId || `msg-${Date.now()}`,
      firestoreSaved,
    });
  } catch (error: any) {
    console.error(
      "[Contact API] Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to submit contact message.",
      },
      { status: 500 }
    );
  }
}