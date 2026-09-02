import { assertSupabaseServerConfig, ENV } from "./_core/env.js";

function getStorageConfig() {
  assertSupabaseServerConfig();

  return {
    baseUrl: ENV.supabaseUrl.replace(/\/+$/, ""),
    serverKey: ENV.supabaseSecretKey,
    bucket: ENV.supabaseStorageBucket,
  };
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "").replace(/\\/g, "/");
}

function publicUrl(baseUrl: string, bucket: string, key: string): string {
  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${key
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const { baseUrl, serverKey, bucket } = getStorageConfig();
  const key = normalizeKey(relKey);

  const response = await fetch(
    `${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${key
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`,
    {
      method: "POST",
      headers: {
        apikey: serverKey,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body:
        typeof data === "string"
          ? new TextEncoder().encode(data)
          : data instanceof Buffer
            ? data
            : new Uint8Array(data),
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Supabase Storage upload failed (${response.status}): ${detail || response.statusText}`,
    );
  }

  return { key, url: publicUrl(baseUrl, bucket, key) };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const { baseUrl, bucket } = getStorageConfig();
  const key = normalizeKey(relKey);
  return { key, url: publicUrl(baseUrl, bucket, key) };
}

export async function storageGetSignedUrl(
  relKey: string,
  expiresIn = 3600,
): Promise<string> {
  const { baseUrl, serverKey, bucket } = getStorageConfig();
  const key = normalizeKey(relKey);

  const response = await fetch(
    `${baseUrl}/storage/v1/object/sign/${encodeURIComponent(bucket)}/${key
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`,
    {
      method: "POST",
      headers: {
        apikey: serverKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn }),
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Supabase Storage signed URL failed (${response.status}): ${detail || response.statusText}`,
    );
  }

  const result = (await response.json()) as { signedURL?: string };
  if (!result.signedURL) throw new Error("Supabase returned an empty signed URL");

  return result.signedURL.startsWith("http")
    ? result.signedURL
    : `${baseUrl}/storage/v1${result.signedURL}`;
}
