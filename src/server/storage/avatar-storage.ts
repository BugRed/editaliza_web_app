import 'server-only';
import { env } from '@/shared/lib/env';
import { decodeAvatarDataUrl } from '@/shared/lib/avatar-image';
import { avatarObjectPath, publicObjectUrl, uploadObject } from './supabase-storage';

/**
 * Guarda a foto do perfil e devolve o que vai no registro (`imgUrl`). Com PHOTO_STORAGE=inline é o próprio data URL
 * (mock e Docker local, que não têm Storage); com `supabase` é o endereço público do arquivo no bucket.
 * Quem chama já validou o data URL.
 */
export async function storeAvatar(ownerId: number, dataUrl: string): Promise<string> {
  if (env.PHOTO_STORAGE !== 'supabase') return dataUrl;

  const config = {
    baseUrl: env.SUPABASE_URL as string,
    serviceKey: env.SUPABASE_SERVICE_ROLE_KEY as string,
    bucket: env.SUPABASE_STORAGE_BUCKET,
  };
  const photo = decodeAvatarDataUrl(dataUrl);
  const objectPath = avatarObjectPath(ownerId, photo.extension, crypto.randomUUID().slice(0, 8));
  await uploadObject(config, objectPath, photo.bytes, photo.contentType);
  return publicObjectUrl(config, objectPath);
}
