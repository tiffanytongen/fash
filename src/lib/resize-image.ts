// Shrinks an image in the browser before upload: phone photos are often
// 3–8 MB, but analysis only needs ~1280px. Smaller uploads are faster and stay
// well under hosting request-size limits (e.g. 4.5 MB on Vercel functions).

const MAX_SIDE = 1280;

export async function resizeImage(file: File): Promise<Blob> {
  // GIFs would lose their animation; small files don't need shrinking.
  if (file.type === "image/gif" || file.size < 300 * 1024) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file; // If the browser can't decode it here, let the server decide.
  }
}
