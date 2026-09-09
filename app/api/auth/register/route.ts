import { NextResponse } from "next/server";
import { findUserByEmail, getEquipe, addUser, activateEquipeMember, clearAllAuthenticatedUsers } from "@/lib/data-store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, nom, company } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs obligatoires" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existing = findUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: "Un compte avec cette adresse e-mail existe déjà. Veuillez vous connecter." },
        { status: 400 }
      );
    }

    // Determine role from Equipe pre-assignment list
    const equipeList = getEquipe();
    const memberInEquipe = equipeList.find(
      (m: any) => m.email?.trim().toLowerCase() === cleanEmail
    );

    // Strict Admin Invitation requirement:
    // If the team list is not empty, user MUST be invited by Admin with an assigned role
    if (equipeList.length > 0 && !memberInEquipe) {
      return NextResponse.json(
        {
          error: "Accès refusé : Votre adresse e-mail n'a pas été invitée par l'administrateur. Veuillez demander à votre administrateur de vous inviter dans la section Équipe avant de créer votre compte."
        },
        { status: 400 }
      );
    }

    const assignedRole = memberInEquipe?.role || "Administrateur";

    if (memberInEquipe) {
      activateEquipeMember(cleanEmail);
    }

    const newUser = addUser({
      email: cleanEmail,
      nom: nom || memberInEquipe?.nom || "Nouvel Utilisateur",
      role: assignedRole,
      company: company || "Tadbir AI Enterprise",
    });

    return NextResponse.json({
      user: newUser,
      access: "mock_access_token_signup",
      refresh: "mock_refresh_token_signup",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    clearAllAuthenticatedUsers();
    return NextResponse.json({ success: true, message: "Tous les comptes utilisateurs enregistrés ont été supprimés avec succès." });
  } catch (err) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression des comptes" },
      { status: 500 }
    );
  }
}

