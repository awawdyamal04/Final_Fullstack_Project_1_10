import nodemailer from "nodemailer";

// Check if email configuration is available
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn("⚠️  Email configuration missing. EMAIL_USER and EMAIL_PASS must be set in environment variables.");
  console.warn("   Forgot password functionality will not work without email configuration.");
}

export const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter connection only if email is configured
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter.verify(function (error, success) {
    if (error) {
      console.error("❌ MAIL ERROR:", error.message);
      console.error("   Make sure EMAIL_USER and EMAIL_PASS are correctly set in your .env file");
      console.error("   For Gmail, you need to use an App Password, not your regular password");
    } else {
      console.log("✅ Email server is ready to take our messages");
      console.log("📧 Email configured for:", process.env.EMAIL_USER);
    }
  });
} else {
  console.log("📧 Email transporter created but not verified (missing credentials)");
}
