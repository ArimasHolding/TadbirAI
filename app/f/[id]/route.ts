import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Base URL for redirection
  const url = new URL(request.url);

  // Determine the correct route based on the document ID prefix
  if (id.startsWith('FAC-')) {
    url.pathname = `/factures/${id}/print`;
  } else if (id.startsWith('DEV-')) {
    url.pathname = `/devis/${id}/print`;
  } else if (id.startsWith('BC-')) {
    url.pathname = `/bons-de-commande/${id}/print`;
  } else {
    // Default fallback
    url.pathname = `/factures/${id}/print`;
  }

  // Redirect to the actual print view
  return NextResponse.redirect(url);
}
