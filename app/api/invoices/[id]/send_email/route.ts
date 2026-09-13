import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getInvoiceById, getClientById } from '@/lib/data-store';
import { getBrevoApiKey, getBrevoSenderEmail, getSmtpCredentials } from '@/lib/email-config';

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

    let emailSent = false;
    let lastMessageId = '';
    let methodUsed = '';
    const errors: string[] = [];

    const brevoApiKey = getBrevoApiKey();
    const brevoSenderEmail = getBrevoSenderEmail();

    if (brevoApiKey && !emailSent) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "api-key": brevoApiKey,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            sender: { name: "Tadbir AI", email: brevoSenderEmail },
            to: [{ email: recipientEmail, name: client.company_name || "Client" }],
            subject,
            htmlContent,
            textContent,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);
        const responseText = await response.text();

        if (response.ok) {
          let resData: any = {};
          try { resData = JSON.parse(responseText); } catch {}
          emailSent = true;
          methodUsed = 'brevo-api';
          lastMessageId = resData.messageId || `brevo-${Date.now()}`;
        } else {
          errors.push(`Brevo API ${response.status}: ${responseText}`);
          console.error("[EMAIL] Brevo error:", responseText);
        }
      } catch (brevoErr: any) {
        const errMsg = brevoErr.name === 'AbortError' ? 'Brevo API timeout (15s)' : brevoErr.message;
        errors.push(`Brevo: ${errMsg}`);
        console.error(`[EMAIL] ❌ Brevo API error: ${errMsg}`);
      }
    }

    const { host: smtpHost, user: smtpUser, pass: smtpPass } = getSmtpCredentials();

    if (!emailSent && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: 587,
          secure: false,
          connectionTimeout: 30000,
          greetingTimeout: 30000,
          socketTimeout: 30000,
          auth: { user: smtpUser, pass: smtpPass },
        });

        const info = await transporter.sendMail({
          from: `"Tadbir AI" <${smtpUser}>`,
          to: recipientEmail,
          subject,
          html: htmlContent,
          text: textContent,
        });

        emailSent = true;
        methodUsed = 'smtp-587';
        lastMessageId = info.messageId || `smtp587-${Date.now()}`;
      } catch (smtpErr: any) {
        errors.push(`SMTP 587: ${smtpErr.message}`);
        console.error(`[EMAIL] ❌ Gmail SMTP 587 failed: ${smtpErr.message}`);
      }
    }

    if (!emailSent && smtpUser && smtpPass) {
      try {
        const transporterSSL = nodemailer.createTransport({
          host: smtpHost,
          port: 465,
          secure: true,
          connectionTimeout: 30000,
          greetingTimeout: 30000,
          socketTimeout: 30000,
          auth: { user: smtpUser, pass: smtpPass },
        });

        const infoSSL = await transporterSSL.sendMail({
          from: `"Tadbir AI" <${smtpUser}>`,
          to: recipientEmail,
          subject,
          html: htmlContent,
          text: textContent,
        });

        emailSent = true;
        methodUsed = 'smtp-465';
        lastMessageId = infoSSL.messageId || `smtp465-${Date.now()}`;
      } catch (sslErr: any) {
        errors.push(`SMTP 465: ${sslErr.message}`);
        console.error(`[EMAIL] ❌ Gmail SMTP 465 failed: ${sslErr.message}`);
      }
    }

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: `Email envoyé à ${recipientEmail}`,
        messageId: lastMessageId,
        method: methodUsed,
      }, { status: 200 });
    } else {
      console.error(`[EMAIL] ❌ ALL METHODS FAILED for ${recipientEmail}. Errors: ${errors.join(' | ')}`);
      return NextResponse.json({ error: `Erreur d'envoi d'e-mail. Méthodes essayées ont échoué. Détails: ${errors.join(' | ')}` }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Erreur d'envoi d'e-mail:", error);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'e-mail: " + error.message }, { status: 500 });
  }
}
