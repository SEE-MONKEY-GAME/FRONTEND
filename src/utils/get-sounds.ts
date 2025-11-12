import { supabase } from '@utils/supabase-client';

export const getBGMs = (filename: string) => {
  const { data } = supabase.storage.from('BGM').getPublicUrl(`${filename}.mp3`);
  return data.publicUrl;
};

export const getEffects = (filename: string) => {
  const { data } = supabase.storage.from('BGM').getPublicUrl(`${filename}.wav`);
  return data.publicUrl;
};
