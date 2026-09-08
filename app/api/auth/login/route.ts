import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    // 1. Strict Super Admin check
    const superAdminEmail = process.env.SMTP_USER || "admin@arimasholding.ma";
    const superAdminPass = process.env.SMTP_PASS || "@a9hhIA7e!X";

    if (email === superAdminEmail && password === superAdminPass) {
      return NextResponse.json({
        user: {
          id: "USR-SUPERADMIN",
          email: superAdminEmail,
          nom: "Administrateur Principal",
          role: "Administrateur",
          company: "Arimas Holding",
        },
        access: "secure_access_token",
        refresh: "secure_refresh_token",
      });
    }

    // 2. Fallback to data.json team members (Strict password check: "password123")
    try {
      const dataFile = path.join(process.cwd(), 'data.json');
      if (fs.existsSync(dataFile)) {
        const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
        const equipe = data.equipeStore || [];
        const found = equipe.find((m: any) => m.email?.toLowerCase().trim() === email.toLowerCase().trim());
        
        if (found) {
          if (password === "12345678") {
            return NextResponse.json({
              user: {
                id: found.id || `USR-${Date.now()}`,
                email: found.email,
                nom: found.nom || "Membre d'équipe",
                role: found.role || "Lecteur",
                company: "Tadbir AI Enterprise",
              },
              access: "team_access_token",
              refresh: "team_refresh_token",
            });
          } else {
            return NextResponse.json({ error: "Mot de passe incorrect pour ce membre de l'équipe." }, { status: 401 });
          }
        }
      }
    } catch (e) {
      console.error("Error reading team data for login:", e);
    }

    return NextResponse.json({ error: "Compte introuvable ou accès non autorisé." }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
