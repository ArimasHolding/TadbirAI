import { NextResponse } from 'next/server';
import { confirmSpreadsheetImport } from '@/lib/spreadsheet-store';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const sessionId = params.id;
    const result = confirmSpreadsheetImport(sessionId);

    return NextResponse.json({
      id: sessionId,
      status: "confirmed",
      data_type: result.data_type,
      inserted_rows: result.inserted_rows || 1
    });
  } catch (error) {
    console.error("Confirm spreadsheet error:", error);
    return NextResponse.json({ error: "Erreur lors de la confirmation d'importation." }, { status: 500 });
  }
}
