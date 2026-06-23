export const GUEST_COOKIE = "guest_session_id";

export const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/RestaurantAI`;

export const FAVICON_URL = `${STORAGE_BASE}/misc/favicon.gif`;
export const AI_ICON_URL = `${STORAGE_BASE}/misc/ai_icon.png`;

export function menuItemImageUrl(filename: string): string {
  return `${STORAGE_BASE}/itens/${filename}`;
}
