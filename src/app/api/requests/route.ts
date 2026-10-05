import { StorageUnavailableError, createRequest } from "@/lib/requests/store";
import { validateRequest, type RequestFormValues } from "@/lib/requests/validate";

// POST /api/requests
// Body: multipart/form-data
//   image    — one inspiration image (JPEG/PNG/WebP/GIF/AVIF, ≤ 5 MB)
//   details  — JSON string of RequestFormValues
// Returns: { id } on success, or { error, fieldErrors? }.
//
// This only records the request. No analysis or matching happens here:
// a person curates the shortlist afterwards.

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

const fail = (status: number, error: string, extra?: object) => Response.json({ error, ...extra }, { status });

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "Expected a form upload.");
  }

  const image = form.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return fail(400, "Please add an inspiration image.", { fieldErrors: { image: "Add one inspiration image." } });
  }
  if (!ACCEPTED.includes(image.type)) return fail(415, "Please upload a JPG, PNG, WebP, GIF or AVIF image.");
  if (image.size > MAX_BYTES) return fail(413, "That image is too large. Please use one under 5 MB.");

  let details: Partial<RequestFormValues>;
  try {
    details = JSON.parse(String(form.get("details") ?? "{}"));
  } catch {
    return fail(400, "The form details were malformed.");
  }

  const result = validateRequest(details);
  if (!result.ok) return fail(422, "Please check the highlighted fields.", { fieldErrors: result.errors });

  try {
    const saved = await createRequest(result.value, {
      bytes: new Uint8Array(await image.arrayBuffer()),
      mimeType: image.type,
      originalName: image.name || "inspiration",
    });
    return Response.json({ id: saved.id }, { status: 201 });
  } catch (err) {
    if (err instanceof StorageUnavailableError) return fail(503, err.message);
    console.error("createRequest failed", err);
    return fail(500, "We couldn't save your request. Please try again.");
  }
}
