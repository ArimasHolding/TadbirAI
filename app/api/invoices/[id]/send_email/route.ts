import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getInvoiceById, getClientById } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const facture = getInvoiceById(params.id);
    if (!facture) {
      return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
    }

    const client = getClientById(facture.client_id);
    if (!client) {
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    }

    const recipientEmail = client.email;
    if (!recipientEmail) {
      return NextResponse.json({ error: "Le client n'a pas d'adresse e-mail." }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Tadbir AI" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `Votre Facture ${facture.numero}`,
      text: `Bonjour ${client.company_name},\n\nVeuillez trouver ci-joint les détails de votre facture ${facture.numero} d'un montant de ${facture.total_ttc} MAD.\n\nMerci de votre confiance.\n\nCordialement,\nL'équipe Tadbir AI`,
      html: `<p>Bonjour <strong>${client.company_name}</strong>,</p>
             <p>Veuillez trouver ci-dessous les détails de votre facture <strong>${facture.numero}</strong> d'un montant de <strong>${facture.total_ttc} MAD</strong>.</p>
             <br/>
             <p>Merci de votre confiance.</p>
             <p><em>Cordialement,</em><br/>L'équipe Tadbir AI</p>`,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Email envoyé", messageId: info.messageId }, { status: 200 });
  } catch (error: any) {
    console.error("Erreur d'envoi d'e-mail:", error);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'e-mail: " + error.message }, { status: 500 });
  }
}
