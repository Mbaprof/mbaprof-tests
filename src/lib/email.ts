import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendNewStudentNotification(student: {
  name: string;
  email: string;
  phone: string;
  college: string;
  course: string;
  targetExam: string;
}) {
  const notifyEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!resend || !notifyEmail) {
    // Not configured yet — registration should never fail because of this.
    console.warn(
      "Skipping new-student email: RESEND_API_KEY or ADMIN_NOTIFICATION_EMAIL not set."
    );
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "MBAProf Tests <onboarding@resend.dev>",
      to: notifyEmail,
      subject: `New student enrolled: ${student.name}`,
      text: [
        "A new student just created an account.",
        "",
        `Name: ${student.name}`,
        `Email: ${student.email}`,
        `Phone: ${student.phone}`,
        `College: ${student.college}`,
        `Course: ${student.course}`,
        `Target exam: ${student.targetExam}`,
        `Signed up: ${new Date().toLocaleString()}`,
      ].join("\n"),
    });
  } catch (error) {
    // A failed notification email should never block a real user's signup.
    console.error("Failed to send new-student notification email:", error);
  }
}

export async function sendPasswordResetEmail(user: {
  name: string;
  email: string;
  resetUrl: string;
}) {
  if (!resend) {
    console.warn("Skipping password reset email: RESEND_API_KEY not set.");
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "MBAProf Tests <onboarding@resend.dev>",
      to: user.email,
      subject: "Reset your MBAProf Tests password",
      text: [
        `Hi ${user.name},`,
        "",
        "We got a request to reset your MBAProf Tests password. Click the link below to choose a new one — it expires in 1 hour:",
        "",
        user.resetUrl,
        "",
        "If you didn't request this, you can safely ignore this email.",
      ].join("\n"),
    });
  } catch (error) {
    // Never let a failed email surface details to the caller — the
    // forgot-password flow always shows the same generic message either
    // way, to avoid leaking which emails have accounts.
    console.error("Failed to send password reset email:", error);
  }
}
