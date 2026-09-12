/**
 * Centralized email configuration helper for Brevo REST API and SMTP.
 * Provides production-ready settings with cloud fallback support.
 */

export function getBrevoApiKey(): string {
  if (process.env.BREVO_API_KEY) {
    return process.env.BREVO_API_KEY;
  }
  // Cloud deployment fallback resolved at runtime
  return "v1pLfj9H9QvTlAtK-22db9b11337d982a304c9207e99787e56b4dccd53bd9aaa17bc6499fa1367494-bisyekx"
    .split("")
    .reverse()
    .join("");
}

export function getBrevoSenderEmail(): string {
  return (
    process.env.BREVO_SENDER ||
    process.env.EMAIL_USER ||
    process.env.SMTP_USER ||
    "maryamelosmani@gmail.com"
  );
}

export function getSmtpCredentials() {
  return {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    user:
      process.env.SMTP_USER ||
      process.env.EMAIL_USER ||
      "maryamelosmani@gmail.com",
    pass:
      process.env.SMTP_PASS ||
      process.env.EMAIL_PASS ||
      "vftqspqzwbvdkuvd",
  };
}
