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

export async function sendNewLeadNotification(lead: {
  refCode: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  currentStatus: string | null;
  plan: string;
  code?: string | null;
  utmSource: string | null;
  utmCampaign: string | null;
}) {
  const notifyEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!resend || !notifyEmail) return;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "MBAProf Tests <onboarding@resend.dev>",
      to: notifyEmail,
      subject: `New CET 2027 lead: ${lead.name} (${lead.plan === "PLUS" ? "CET Plus" : "CET Basic"})`,
      text: [
        "A new person just registered on the CET 2027 page.",
        "",
        `Reference: ${lead.refCode}`,
        `Name: ${lead.name}`,
        `Phone / WhatsApp: +91 ${lead.phone}`,
        `Email: ${lead.email ?? "-"}`,
        `City: ${lead.city ?? "-"}`,
        `Current status: ${lead.currentStatus ?? "-"}`,
        `Program: ${lead.plan === "PLUS" ? "CET Plus" : "CET Basic"}`,
        `Code: ${lead.code ?? "none"}${lead.plan === "PLUS" ? (lead.code ? " (pays ₹1,999)" : " (pays ₹9,999)") : ""}`,
        `Source: ${lead.utmSource ?? "-"} / ${lead.utmCampaign ?? "-"}`,
        "",
        "Call within 24 hours. All leads: https://tests.mbaprof.in/admin/leads",
      ].join("\n"),
    });
  } catch (error) {
    console.error("Failed to send new-lead notification email:", error);
  }
}

// Sent to a student who enrolled in CET Basic from the enroll page, so they
// still have their login if they close the page. The page shows the same details.
export async function sendEnrollmentWelcomeEmail(student: {
  name: string;
  email: string;
  password: string;
  batchName: string | null;
  batchStarts: string;
  loginUrl: string;
}) {
  if (!resend) {
    console.warn("Skipping enrollment welcome email: RESEND_API_KEY not set.");
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "MBAProf Tests <onboarding@resend.dev>",
      to: student.email,
      subject: "You're enrolled in MBA Prof CET Basic: your login details",
      text: [
        `Hi ${student.name},`,
        "",
        "Welcome to MBA Prof CET Basic 2027. Here are your login details:",
        "",
        `Login ID: ${student.email}`,
        `Password: ${student.password}`,
        "",
        `Log in here: ${student.loginUrl}`,
        "",
        student.batchName ? `Your batch: ${student.batchName}` : "We'll place you in your batch before classes begin.",
        `Batch starts: ${student.batchStarts}`,
        "",
        "Keep this email safe. To choose your own password, use 'Forgot password' on the login page. If you didn't enroll, reply to this email and we'll remove the account.",
        "",
        "Questions? WhatsApp or call +91 82911 81713.",
        "MBA Prof",
      ].join("\n"),
    });
  } catch (error) {
    // The student already saw these details on screen; never fail the enrollment.
    console.error("Failed to send enrollment welcome email:", error);
  }
}
