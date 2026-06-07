import { supabase } from './supabase';

export async function uploadPublicFile(
  file: File,
  options: { bucket?: string; path: string; fileName?: string }
) {
  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
  const safeName = options.fileName || `${Date.now()}-${crypto.randomUUID()}`;
  const path = `${options.path.replace(/\/+$/, '')}/${safeName}.${extension}`;
  const bucket = options.bucket || 'SellHealthStorage';

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}