import { supabase } from "./supabase";

export interface UploadResult {
  url: string;
  path: string;
  success: boolean;
  error?: string;
}

export async function uploadPhotoToSupabase(file: File, folder: string = 'models'): Promise<UploadResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${folder}/${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(error.message);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      path: fileName,
      success: true
    };
  } catch (error) {
    return {
      url: '',
      path: '',
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

export async function uploadBufferToSupabase(buffer: Buffer, filename: string, folder: string = 'models'): Promise<UploadResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = filename.split('.').pop() || 'jpg';
    const fileName = `${folder}/${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
    
    // Convert Buffer to Blob - handle both Node.js Buffer and ArrayBuffer
    const uint8Array = new Uint8Array(buffer);
    const blob = new Blob([uint8Array]);
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('photos')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(error.message);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      path: fileName,
      success: true
    };
  } catch (error) {
    return {
      url: '',
      path: '',
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

export async function deletePhotoFromSupabase(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('photos')
      .remove([path]);

    return !error;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
}
