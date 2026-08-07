/**
 * Document parser service.
 * Supports PDF (via pdf-parse), DOCX (via mammoth), and plain text.
 *
 * Two entry points:
 *   - parseDocument(input)         : base64-encoded string or raw plain text
 *   - parseDocumentBuffer(buf, fn) : raw Buffer from a multipart file upload
 */
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export type DocumentFormat = "pdf" | "docx" | "text";

/**
 * Detect file format from base64 magic bytes, or assume plain text.
 */
function detectFormat(data: string): DocumentFormat {
    if (data.startsWith("JVBERi")) return "pdf";   // %PDF-
    if (data.startsWith("UEsD"))   return "docx";  // ZIP/DOCX PK header
    return "text";
}

/**
 * Detect format from a raw Buffer using magic bytes.
 * Falls back to filename extension if magic bytes are inconclusive.
 */
function detectFormatFromBuffer(buf: Buffer, filename?: string): DocumentFormat {
    // PDF magic: %PDF- = 0x25 0x50 0x44 0x46 0x2D
    if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return "pdf";
    // ZIP/DOCX magic: PK = 0x50 0x4B 0x03 0x04
    if (buf[0] === 0x50 && buf[1] === 0x4B && buf[2] === 0x03 && buf[3] === 0x04) return "docx";

    if (filename) {
        const ext = filename.split(".").pop()?.toLowerCase();
        if (ext === "pdf")  return "pdf";
        if (ext === "docx") return "docx";
    }
    return "text";
}

/**
 * Parse a contract document from a raw Buffer (e.g. from a multipart file upload).
 */
export async function parseDocumentBuffer(buf: Buffer, filename?: string): Promise<string> {
    const format = detectFormatFromBuffer(buf, filename);

    if (format === "pdf") {
        const result = await pdfParse(buf);
        const text = result.text.trim();
        if (!text) throw new Error("PDF parsed but no text was extracted. The file may be image-only or scanned.");
        return text;
    }

    if (format === "docx") {
        const result = await mammoth.extractRawText({ buffer: buf });
        const text = result.value.trim();
        if (!text) throw new Error("DOCX parsed but no text was extracted.");
        return text;
    }

    return buf.toString("utf-8").trim();
}

/**
 * Parse a contract document from a base64 string or raw plain text.
 */
export async function parseDocument(input: string): Promise<string> {
    const format = detectFormat(input);

    if (format === "text") return input.trim();

    const buffer = Buffer.from(input, "base64");

    if (format === "pdf") {
        const result = await pdfParse(buffer);
        const text = result.text.trim();
        if (!text) throw new Error("PDF parsed but no text was extracted. The file may be image-only or scanned.");
        return text;
    }

    if (format === "docx") {
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value.trim();
        if (!text) throw new Error("DOCX parsed but no text was extracted.");
        return text;
    }

    throw new Error("Unsupported document format.");
}

// ── Legacy aliases so existing imports keep working during migration ──────────
export { parseDocumentBuffer as parseResumeBuffer, parseDocument as parseResume };
