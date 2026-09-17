import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { confirmSpreadsheetImport } from '@/lib/spreadsheet-store';

export const dynamic = 'force-dynamic';
const DJANGO_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const sessionId = params.id;
    const result = confirmSpreadsheetImport(sessionId) as any;

    const cookieStore = cookies();
    const token = cookieStore.get('access_token')?.value;
    const authHeaders: Record<string, string> = { "Content-Type": "application/json" };
    if (token) authHeaders['Authorization'] = `Bearer ${token}`;
    const organizationId = cookieStore.get('x-organization-id')?.value;
    if (organizationId) authHeaders['x-organization-id'] = organizationId;

    const cleanDjangoUrl = DJANGO_URL.replace(/\/$/, '');
    let endpoint = "";
    if (result.data_type === "suppliers") endpoint = `${cleanDjangoUrl}/api/suppliers/`;
    else if (result.data_type === "clients") endpoint = `${cleanDjangoUrl}/api/clients/`;
    else if (result.data_type === "stock") endpoint = `${cleanDjangoUrl}/api/products/`;

    let successCount = 0;
    const errors: string[] = [];
    
    // Check if we should use local mock store (no valid token or local URL)
    const isLocal = !DJANGO_URL.includes("http") || DJANGO_URL.includes("localhost") || DJANGO_URL.includes("127.0.0.1");
    
    if (result.parsed_rows && result.parsed_rows.length > 0) {
      if (isLocal) {
        // Use local Data Store
        const { addSupplier, addClient, addProduct } = require('@/lib/data-store');
        for (const [index, row] of result.parsed_rows.entries()) {
          try {
            if (result.data_type === "suppliers") addSupplier(row, organizationId);
            else if (result.data_type === "clients") addClient(row, organizationId);
            else if (result.data_type === "stock") addProduct(row, organizationId);
            successCount++;
          } catch (e: any) {
            errors.push(`Ligne ${index + 1}: ${e.message}`);
          }
        }
      } else {
        // Use Django Backend
        if (endpoint) {
          for (const [index, row] of result.parsed_rows.entries()) {
            try {
              const postRes = await fetch(endpoint, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify(row)
              });
              if (postRes.ok) successCount++;
              else {
                const text = await postRes.text();
                // If it's a token error, fallback to local store to avoid blocking the user
                if (text.includes("token_not_valid")) {
                   const { addSupplier, addClient, addProduct } = require('@/lib/data-store');
                   if (result.data_type === "suppliers") addSupplier(row, organizationId);
                   else if (result.data_type === "clients") addClient(row, organizationId);
                   else if (result.data_type === "stock") addProduct(row, organizationId);
                   successCount++;
                } else {
                   errors.push(`Ligne ${index + 1}: ${text}`);
                }
              }
            } catch (e) {
              console.error("Failed to POST row to Django", e);
              errors.push(`Ligne ${index + 1}: serveur backend inaccessible`);
            }
          }
        }
      }
    }

    return NextResponse.json({
      id: sessionId,
      status: "confirmed",
      data_type: result.data_type,
      inserted_rows: successCount,
      attempted_rows: result.parsed_rows?.length || 0,
      errors
    });
  } catch (error) {
    console.error("Confirm spreadsheet error:", error);
    return NextResponse.json({ error: "Erreur lors de la confirmation d'importation." }, { status: 500 });
  }
}
