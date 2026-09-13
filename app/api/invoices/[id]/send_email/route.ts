import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getInvoiceById, getClientById } from '@/lib/data-store';
import { getSmtpCredentials, getBrevoSenderEmail, getBrevoSenderName, getOauth2Credentials } from '@/lib/email-config';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const facture = getInvoiceById(params.id);
    if (!facture) {
      return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
    }

    // Facture uses "client" as the client ID
    const client = getClientById(facture.client || "");
    if (!client) {
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    }

    const recipientEmail = client.email;
    if (!recipientEmail) {
      return NextResponse.json({ error: "Le client n'a pas d'adresse e-mail." }, { status: 400 });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 32px; border-radius: 12px;">
        <div style="background: #1e293b; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Tadbir AI</h1>
          <p style="color: #94a3b8; margin: 6px 0 0;">Votre facture est disponible</p>
        </div>
        <p style="color: #334155; font-size: 15px;">Bonjour <strong>${client.company_name}</strong>,</p>
        <p style="color: #334155; font-size: 15px;">
          Veuillez trouver ci-dessous les détails de votre facture :
        </p>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: #64748b; padding: 8px 0; font-size: 14px;">Numéro de facture</td>
              <td style="color: #1e293b; font-weight: bold; text-align: right; font-size: 14px;">${facture.invoice_number}</td>
            </tr>
            <tr>
              <td style="color: #64748b; padding: 8px 0; font-size: 14px;">Montant Total TTC</td>
              <td style="color: #6366f1; font-weight: bold; text-align: right; font-size: 16px;">${facture.total_amount} MAD</td>
            </tr>
            <tr>
              <td style="color: #64748b; padding: 8px 0; font-size: 14px;">Statut</td>
              <td style="text-align: right;"><span style="background: #fef3c7; color: #92400e; padding: 2px 10px; border-radius: 20px; font-size: 13px;">${facture.status || 'En attente'}</span></td>
            </tr>
          </table>
        </div>
        <p style="color: #64748b; font-size: 13px; margin-top: 24px;">
          Merci de votre confiance. Pour toute question, n'hésitez pas à nous contacter.
        </p>
        <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 16px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">Tadbir AI — Votre logiciel de gestion entreprise</p>
        </div>
      </div>
    `;

    const textContent = `Bonjour ${client.company_name},\n\nVotre facture ${facture.invoice_number} d'un montant de ${facture.total_amount} MAD est disponible.\n\nMerci de votre confiance.\n\nTadbir AI`;
    const subject = `Votre Facture ${facture.invoice_number} — Tadbir AI`;

    const { host: smtpHost, port: smtpPort, user: smtpUser, pass: smtpPass } = getSmtpCredentials();
    const { clientId, clientSecret, refreshToken } = getOauth2Credentials();
    const senderEmail = smtpUser || getBrevoSenderEmail(); // Ensure we use the Gmail account
    const senderName = getBrevoSenderName();

    if (!smtpUser) {
       console.error("[EMAIL] Missing SMTP credentials");
       return NextResponse.json({ error: "Configuration SMTP manquante sur le serveur." }, { status: 500 });
    }

    let authConfig: any = { user: smtpUser, pass: smtpPass };
    
    // Switch to OAuth2 if tokens are provided
    if (clientId && clientSecret && refreshToken) {
      authConfig = {
        type: 'OAuth2',
        user: smtpUser,
        clientId: clientId,
        clientSecret: clientSecret,
        refreshToken: refreshToken,
      };
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: authConfig,
    });

    try {
      const info = await transporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to: recipientEmail,
        subject,
        html: htmlContent,
        text: textContent,
      });

      return NextResponse.json({
        success: true,
        message: `Email envoyé à ${recipientEmail}`,
        messageId: info.messageId,
        method: 'smtp-brevo',
      }, { status: 200 });

    } catch (smtpErr: any) {
      console.error(`[EMAIL] ❌ SMTP send failed: ${smtpErr.message}`);
      return NextResponse.json({ error: `Erreur d'envoi d'e-mail: ${smtpErr.message}` }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Erreur d'envoi d'e-mail:", error);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'e-mail: " + error.message }, { status: 500 });
  }
}
