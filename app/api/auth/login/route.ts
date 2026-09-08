import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Accept any credentials for demo purposes
    if (email && password) {
      return NextResponse.json({
        user: {
          id: 1,
          email: email,
          nom: "Administrateur",
          role: "Administrateur",
          company: "Tadbir AI Demo",
        },
        access: "mock_access_token_12345",
        refresh: "mock_refresh_token_67890",
      });
    }

    return NextResponse.json(
      { error: "Email et mot de passe requis" },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
