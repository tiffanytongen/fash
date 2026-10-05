import { matchInspiration } from "@/lib/matching";

// POST /api/match
// Body: multipart/form-data with one field, `image` (a JPEG/PNG/WebP/GIF/AVIF file).
// Returns: MatchResponse JSON (see src/lib/matching/types.ts).
//
// The image is only held in memory for this request. It is never written
// to disk or stored.

const MAX_BYTES = 5 * 1024 * 1024; // the browser shrinks images first, so this is generous
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

const fail = (status: number, error: string) => Response.json({ error }, { status });

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "Expected a form upload with an image.");
  }

  const image = form.get("image");
  if (!(image instanceof File)) return fail(400, "No image was attached.");
  if (!ACCEPTED.includes(image.type)) return fail(415, "Please upload a JPG, PNG, WebP, GIF or AVIF image.");
  if (image.size === 0) return fail(400, "The image file is empty.");
  if (image.size > MAX_BYTES) return fail(413, "That image is too large. Please use one under 5 MB.");

  try {
    const bytes = new Uint8Array(await image.arrayBuffer());
    const result = await matchInspiration({ bytes, mimeType: image.type });
    return Response.json(result);
  } catch (err) {
    console.error("matchInspiration failed", err);
    return fail(500, "We couldn't analyse that image. Please try again.");
  }
}
