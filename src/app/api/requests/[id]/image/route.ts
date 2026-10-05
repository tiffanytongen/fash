import { getRequestImage } from "@/lib/requests/store";

// GET /api/requests/[id]/image — the request's inspiration image.
// Access is by unguessable request id only (there are no accounts yet).

export async function GET(_request: Request, ctx: RouteContext<"/api/requests/[id]/image">) {
  const { id } = await ctx.params;
  const image = await getRequestImage(id);
  if (!image) return new Response("Not found", { status: 404 });

  return new Response(image.bytes as BodyInit, {
    headers: {
      "Content-Type": image.mimeType,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
