import { useState } from "react";

interface UploadResult {
  url: string;
  key: string;
}

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File, folder: string = "media"): Promise<UploadResult | null> {
    setUploading(true);
    setError(null);
    try {
      // Get upload URL from server
      const keyRes = await fetch(
        `/api/upload?key=${encodeURIComponent(`upload/${folder}/${Date.now()}-${file.name}`)}&contentType=${encodeURIComponent(file.type)}`,
        { method: "POST", body: await file.arrayBuffer(), headers: { "Content-Type": file.type } }
      );
      if (!keyRes.ok) throw new Error("Upload falhou");
      const data = await keyRes.json() as UploadResult;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no upload");
      return null;
    } finally {
      setUploading(false);
    }
  }

  return { upload, uploading, error };
}
