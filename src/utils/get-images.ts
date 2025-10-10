import { supabase } from '@utils/supabase-client';

export const getImage = (foldername: string, filename: string) => {
  const { data } = supabase.storage.from(foldername).getPublicUrl(`${filename}.png`);
  return data.publicUrl;
};
