import { NextResponse } from "next/server";
import { findUserByEmail, findEquipeMemberByEmail, getEquipe, addUser, activateEquipeMember } from "@/lib/data-store";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, nom, company } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs obligatoires (adresse e-mail et mot de passe)." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check team invitation list (RBAC requirement)
    const equipeList = getEquipe();
    const memberInEquipe = findEquipeMemberByEmail(cleanEmail) || equipeList.find(
      (m: any) => m.email?.trim().toLowerCase() === cleanEmail
    );

    // Initial Bootstrap: If database is completely fresh, allow first administrator
    const isFirstUser = equipeList.length === 0;

    if (!memberInEquipe && !isFirstUser) {
      return NextResponse.json(
        {
          error: "Accès refusé : Votre adresse e-mail n'a pas été invitée par l'administrateur. Veuillez demander à votre administrateur de vous inviter dans la section Équipe avant de créer votre compte."
        },
        { status: 403 }
      );
    }

    // Block suspended members
    if (memberInEquipe && memberInEquipe.statut === "Suspendu") {
      return NextResponse.json(
        { error: "Ce compte a été suspendu par l'administrateur. Veuillez contacter votre responsable." },
        { status: 403 }
      );
    }

    // 2. Check if an active user with custom password already exists
    const existingUser = findUserByEmail(cleanEmail);
    const isDefaultHash = existingUser?.password === "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";
    const isInvitedStatus = memberInEquipe?.statut === "Invité";

    if (existingUser && existingUser.password && !isDefaultHash && !isInvitedStatus) {
      return NextResponse.json(
        { error: "Un compte avec cette adresse e-mail existe déjà. Veuillez vous connecter." },
        { status: 400 }
      );
    }

    // Determine role from Equipe assignment
    const VALID_ROLES = ["Administrateur", "Comptable", "Commercial", "Lecteur"];
    const rawRole: string = memberInEquipe?.role || (isFirstUser ? "Administrateur" : "Lecteur");
    const assignedRole = rawRole.toLowerCase().includes("admin")
      ? "Administrateur"
      : VALID_ROLES.includes(rawRole)
      ? rawRole
      : "Lecteur";

    // Mark as active in equipe
    if (memberInEquipe) {
      activateEquipeMember(cleanEmail);
    }

    // 3. Create or activate user account in local data store
    const newUser = addUser({
      email: cleanEmail,
      password: password,
      nom: nom || memberInEquipe?.nom || cleanEmail.split('@')[0],
      role: assignedRole,
      company: company || "Tadbir AI Enterprise",
    });

    // 4. Propagate registration to Django backend for persistent storage
    let access = "session_token_app";
    let refresh = "session_refresh_app";

    try {
      const djangoUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const tokenRes = await fetch(`${djangoUrl}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password: password,
          nom: nom || memberInEquipe?.nom || cleanEmail.split('@')[0],
          role: assignedRole,
        }),
      });
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        if (tokenData.access) access = tokenData.access;
        if (tokenData.refresh) refresh = tokenData.refresh;
      }
    } catch {
      // Backend optional fallback
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        nom: newUser.nom,
        role: newUser.role,
        company: newUser.company,
        emailVerified: true
      },
      access,
      refresh,
    });
  } catch (err: any) {
    console.error("[REGISTER] Error creating user:", err);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte." },
      { status: 500 }
    );
  }
}

