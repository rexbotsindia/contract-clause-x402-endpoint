/**
 * fileReader.ts
 *
 * Extracts plain text from uploaded contract files.
 * Supported formats: PDF, DOCX, plain text.
 *
 * Exported functions:
 *   extractFromBuffer(buf, filename?) — for multipart file uploads
 *   extractFromString(input)          — for base64-encoded or raw text payloads
 */
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

type FileKind = "pdf" | "docx" | "text";

// ── Format detection ──────────────────────────────────────────────────────────

function sniffBase64(data: string): FileKind {
    if (data.startsWith("JVBERi")) return "pdf";  // base64 of %PDF-
    if (data.startsWith("UEsD"))   return "docx"; // base64 of PK ZIP header
    return "text";
}

function sniffBuffer(buf: Buffer, hint?: string): FileKind {
    // PDF magic bytes: %PDF-
    if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return "pdf";
    // DOCX / ZIP magic bytes: PK
    if (buf[0] === 0x50 && buf[1] === 0x4B && buf[2] === 0x03 && buf[3] === 0x04) return "docx";

    // Fall back to file extension
    if (hint) {
        const ext = hint.split(".").pop()?.toLowerCase();
        if (ext === "pdf")  return "pdf";
        if (ext === "docx") return "docx";
    }
    return "text";
}

// ── Extraction helpers ────────────────────────────────────────────────────────

async function readPdf(buf: Buffer): Promise<string> {
    const result = await pdfParse(buf);
    const text = result.text.trim();
    if (!text) throw new Error("PDF contained no extractable text — it may be scanned or image-only.");
    return text;
}

async function readDocx(buf: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer: buf });
    const text = result.value.trim();
    if (!text) throw new Error("DOCX contained no extractable text.");
    return text;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Extract text from a raw Buffer received via multipart upload.
 */
export async function extractFromBuffer(buf: Buffer, filename?: string): Promise<string> {
    const kind = sniffBuffer(buf, filename);
    if (kind === "pdf")  return readPdf(buf);
    if (kind === "docx") return readDocx(buf);
    return buf.toString("utf-8").trim();
}

/**
 * Extract text from a base64-encoded string or plain-text payload.
 */
export async function extractFromString(input: string): Promise<string> {
    const kind = sniffBase64(input);
    if (kind === "text") return input.trim();

    const buf = Buffer.from(input, "base64");
    if (kind === "pdf")  return readPdf(buf);
    if (kind === "docx") return readDocx(buf);

    throw new Error("Unrecognised file format.");
}
