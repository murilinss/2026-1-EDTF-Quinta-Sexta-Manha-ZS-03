import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { base64 } = await req.json();
    const buffer = Buffer.from(base64, "base64");
    
    const pdfParsePath = path.join(process.cwd(), "node_modules/pdf-parse/dist/pdf-parse/cjs/index.cjs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require(pdfParsePath);
    const data = await pdfParse(buffer);
    
    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao extrair PDF" }, { status: 500 });
  }
}