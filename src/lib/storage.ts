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

export async function deletePublicFile(
  url: string,
  bucket: string = 'SellHealthStorage'
) {
  try {
    const urlObj = new URL(url);
    const bucketPrefix = `/storage/v1/object/public/${bucket}/`;
    const pathStart = urlObj.pathname.indexOf(bucketPrefix);
    if (pathStart === -1) return;
    
    const path = urlObj.pathname.substring(pathStart + bucketPrefix.length);
    if (!path) return;

    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) console.error('Failed to delete storage file:', error);
  } catch (e) {
    console.error('Failed to parse URL for deletion:', e);
  }
}