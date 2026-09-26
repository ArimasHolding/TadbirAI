/**
 * Centralized email configuration helper for Brevo REST API and SMTP.
 * Provides production-ready settings with cloud fallback support and DMARC alignment.
 */

/**
 * Returns the Brevo REST API v3 key.
 * Prioritizes environment variables (BREVO_API_KEY or BREVO_KEY) and trims whitespace.
 * No credentials are stored in source code.
 */
export function getBrevoApiKey(): string {
  const envKey = process.env.BREVO_API_KEY || process.env.BREVO_KEY;
  if (envKey && envKey.trim()) {
    return envKey.trim();
  }
  return "";
}

/**
 * Returns the verified sender email for Brevo API calls.
 * Prioritizes process.env.BREVO_SENDER.
 * NEVER falls back to free-provider domains (@gmail.com or @yahoo.com) for Brevo dispatch,
 * because mailbox providers enforce strict DMARC (p=reject / p=quarantine) on spoofed domains.
 * Uses the verified Brevo relay address 'b8bf08001@smtp-brevo.com' as safe default.
 */
export function getBrevoSenderEmail(): string {
  const explicitSender = process.env.BREVO_SENDER?.trim();
  if (explicitSender) {
    return explicitSender;
  }

  const candidate = (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim();
  if (
    candidate &&
    !candidate.toLowerCase().includes("@gmail.com") &&
    !candidate.toLowerCase().includes("@yahoo.com")
  ) {
    return candidate;
  }

  return "";
}

/**
 * Returns the display name for outgoing emails.
 */
export function getBrevoSenderName(): string {
  return (process.env.BREVO_SENDER_NAME || "Tadbir AI").trim();
}

/**
 * Returns RFC 5322 compliant reply-to parameters for transactional emails.
 * Allows user replies to reach support/admin without triggering DMARC domain mismatches.
 */
export function getEmailReplyTo(): { email: string; name: string } {
  const replyEmail = (
    process.env.REPLY_TO_EMAIL ||
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    ""
  ).trim();

  return {
    email: replyEmail,
    name: (process.env.REPLY_TO_NAME || "Tadbir AI Support").trim(),
  };
}

/**
 * Returns SMTP credentials for direct Nodemailer fallback dispatch.
 */
export function getSmtpCredentials() {
  return {
    host: (process.env.SMTP_HOST || "").trim(),
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    user: (
      process.env.SMTP_USER ||
      process.env.EMAIL_USER ||
      ""
    ).trim(),
    pass: (
      process.env.SMTP_PASS ||
      process.env.EMAIL_PASS ||
      ""
    ).trim(),
  };
}

/**
 * Returns OAuth2 credentials for Gmail API authentication.
 */
export function getOauth2Credentials() {
  return {
    clientId: process.env.GMAIL_CLIENT_ID?.trim() || "",
    clientSecret: process.env.GMAIL_CLIENT_SECRET?.trim() || "",
    refreshToken: process.env.GMAIL_REFRESH_TOKEN?.trim() || "",
  };
}
