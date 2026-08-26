import { supabase } from './supabase';

export const PROFILE_IMAGE_BUCKET = 'portfolio-media';
export const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PROFILE_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/avif';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export function validateProfileImage(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Escolha uma imagem JPG, PNG, WebP ou AVIF.';
  }

  if (file.size > PROFILE_IMAGE_MAX_BYTES) {
    return 'A foto deve ter no máximo 5 MB.';
  }

  return null;
}

function extensionForFile(file: File): string {
  switch (file.type) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/avif':
      return 'avif';
    default:
      return 'jpg';
  }
}

export async function uploadProfileImage(file: File): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase não está configurado neste ambiente.');
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error('Não foi possível verificar sua sessão do Supabase.');
  }

  if (!sessionData.session?.user) {
    throw new Error('É necessário estar autenticada com uma conta do Supabase para enviar arquivos.');
  }

  const userId = sessionData.session.user.id;
  const extension = extensionForFile(file);
  const filePath = `profile/${userId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(PROFILE_IMAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message || 'Não foi possível enviar a foto.');
  }

  const { data } = supabase.storage.from(PROFILE_IMAGE_BUCKET).getPublicUrl(filePath);

  if (!data.publicUrl) {
    await supabase.storage.from(PROFILE_IMAGE_BUCKET).remove([filePath]);
    throw new Error('O arquivo foi enviado, mas a URL pública não pôde ser criada.');
  }

  return data.publicUrl;
}

export function getProfileStoragePath(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${PROFILE_IMAGE_BUCKET}/`;
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) return null;

  return decodeURIComponent(publicUrl.slice(markerIndex + marker.length));
}

export async function removeProfileImage(publicUrl: string): Promise<void> {
  if (!supabase) return;

  const path = getProfileStoragePath(publicUrl);
  if (!path) return;

  const { error } = await supabase.storage.from(PROFILE_IMAGE_BUCKET).remove([path]);

  if (error) {
    console.warn('Não foi possível remover a foto antiga do Storage:', error.message);
  }
}
