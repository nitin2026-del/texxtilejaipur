import { supabase } from './supabaseClient';

/**
 * Upload a file to the "images" bucket.
 * @param {File} file - The file object to upload.
 * @param {string} path - Desired storage path (e.g., 'products/1.jpg').
 * @returns {Promise<any>} Supabase storage response data.
 */
export async function uploadImage(file, path) {
  const { data, error } = await supabase.storage
    .from('images')
    .upload(path, file, { upsert: true });
  if (error) {
    console.error('Supabase upload error', error);
    throw error;
  }
  return data;
}

/**
 * Get a public URL for a stored file.
 * @param {string} path - Path inside the bucket (e.g., 'products/1.jpg').
 * @returns {string} Public URL.
 */
export function getPublicUrl(path) {
  const { publicURL } = supabase.storage.from('images').getPublicUrl(path);
  return publicURL;
}
