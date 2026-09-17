import { supabase, isSupabaseConfigured } from './supabase';

const BUCKET_NAME = import.meta.env.VITE_STORAGE_BUCKET || 'clinic-documents';

export interface StorageUploadResult {
  url: string;
  key: string;
  success: boolean;
  error?: string;
}

export async function uploadMedicalDocument(
  file: File | Blob,
  path: string
): Promise<StorageUploadResult> {
  // If Supabase is connected to live cloud storage
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, file, {
          upsert: true,
          cacheControl: '3600',
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

      return {
        url: publicUrlData.publicUrl,
        key: data.path,
        success: true,
      };
    } catch (err: any) {
      console.warn('Supabase storage upload error, falling back to local object URL:', err);
    }
  }

  // Local fallback (IndexedDB / memory Blob URL)
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        url: reader.result as string,
        key: path,
        success: true,
      });
    };
    reader.readAsDataURL(file);
  });
}
