import { handleLocalApi } from '@/lib/local-api';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getSmtpCredentials } from '@/lib/email-config';
import { addSupportTicket } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) { return handleLocalApi(req); }

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sujet, message } = body;

    const smtp = getSmtpCredentials();
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      }
    });

    const mailOptions = {
      from: `"Tadbir AI Platform" <${smtp.user}>`,
      to: 'support@tadbir.ai',
      replyTo: smtp.user,
      subject: `Nouveau Ticket de Support: ${sujet || 'Assistance'}`,
      html: `
        <div style="font-family: sans-serif; max-w-[600px]; padding: 20px;">
          <h2 style="color: #4F46E5;">Nouveau Ticket de Support</h2>
          <p><strong>Sujet :</strong> ${sujet}</p>
          <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-top: 15px;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #64748b; font-size: 12px; margin-top: 20px;">Ce message a été généré automatiquement par la plateforme Tadbir AI.</p>
        </div>
      `,
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);

    // Sauvegarder le ticket dans le store local
    const newTicket = {
      id: "TKT-" + Math.floor(1000 + Math.random() * 9000),
      sujet: sujet || "Demande d'assistance",
      message: message,
      status: "Nouveau",
      date: new Date().toISOString()
    };

    addSupportTicket(newTicket);

    return NextResponse.json({ success: true, ticket: newTicket });
  } catch (error) {
    console.error("Erreur d'envoi d'email de support:", error);
    // Even if email fails, we might want to save the ticket? Let's return error so UI shows it.
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}

export async function PUT(req: Request) { return handleLocalApi(req); }
export async function PATCH(req: Request) { return handleLocalApi(req); }
export async function DELETE(req: Request) { return handleLocalApi(req); }
