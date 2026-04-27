import "server-only";
import { createAdminClient } from "./admin";

export const PLACE_PHOTOS_BUCKET = "place-photos";
export const SUGGESTION_PHOTOS_BUCKET = "suggestion-photos";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB

function safeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-]/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Uploads a single image to Supabase Storage and returns its public URL.
 */
export async function uploadPhoto(
  bucket: string,
  file: File,
  pathPrefix: string,
): Promise<string> {
  if (!ALLOWED_MIME.includes(file.type)) {
    throw new Error(`Nepodporovaný formát: ${file.type}`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Soubor je větší než 30 MB.");
  }

  const supabase = createAdminClient();
  const path = `${pathPrefix}/${Date.now()}-${safeFileName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(`Upload selhal: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Deletes a photo by its public URL.
 */
export async function deletePhotoByUrl(
  bucket: string,
  publicUrl: string,
): Promise<void> {
  // Public URL shape: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return; // not a Supabase Storage URL — skip
  const path = publicUrl.slice(idx + marker.length);
  const supabase = createAdminClient();
  await supabase.storage.from(bucket).remove([path]);
}

/**
 * Ensures the place-photos bucket exists with public read access.
 * Idempotent — safe to call multiple times.
 */
export async function ensurePlacePhotosBucket(): Promise<void> {
  const supabase = createAdminClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  const existing = buckets?.find((b) => b.name === PLACE_PHOTOS_BUCKET);

  if (existing) {
    if (existing.file_size_limit !== MAX_FILE_SIZE) {
      const { error } = await supabase.storage.updateBucket(
        PLACE_PHOTOS_BUCKET,
        {
          public: true,
          fileSizeLimit: MAX_FILE_SIZE,
          allowedMimeTypes: ALLOWED_MIME,
        },
      );
      if (error) {
        throw new Error(`Nelze aktualizovat bucket: ${error.message}`);
      }
    }
    return;
  }

  const { error } = await supabase.storage.createBucket(PLACE_PHOTOS_BUCKET, {
    public: true,
    fileSizeLimit: MAX_FILE_SIZE,
    allowedMimeTypes: ALLOWED_MIME,
  });
  if (error && !error.message.includes("already exists")) {
    throw new Error(`Nelze vytvořit bucket: ${error.message}`);
  }
}
