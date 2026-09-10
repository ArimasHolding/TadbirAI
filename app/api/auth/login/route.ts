import { NextResponse } from "next/server";
import { findUserByEmail, getEquipe } from "@/lib/data-store";
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Veuillez fournir une adresse e-mail et un mot de passe." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = findUserByEmail(cleanEmail);

    if (!user) {
      return NextResponse.json(
        { error: "Aucun compte trouvé. Veuillez créer un compte d'abord." },
        { status: 401 }
      );
    }

    // Hash the incoming password to compare
    const hashedInputPassword = crypto.createHash('sha256').update(password).digest('hex');

    if (user.password !== hashedInputPassword) {
      return NextResponse.json(
        { error: "Mot de passe incorrect." },
        { status: 401 }
      );
    }

    // Verify if still active in equipe (optional RBAC safety)
    const equipeList = getEquipe();
    const memberInEquipe = equipeList.find(
      (m: any) => m.email?.trim().toLowerCase() === cleanEmail
    );

    if (memberInEquipe && memberInEquipe.statut === "Suspendu") {
      return NextResponse.json(
        { error: "Votre compte a été suspendu par l'administrateur." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        role: user.role,
        company: user.company,
        emailVerified: user.emailVerified
      }
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Erreur serveur lors de la connexion." },
      { status: 500 }
    );
  }
}
