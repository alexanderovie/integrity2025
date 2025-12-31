import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

/**
 * Cliente de Supabase para Client Components (Next.js 16+)
 * Usa createBrowserClient de @supabase/ssr para manejo correcto de cookies y SSR
 * Patrón moderno y recomendado por Supabase para Next.js 16+
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
