import UserProfile from "@/components/Auth/UserProfile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profile | Integrity Clean Solutions",
  alternates: {
    canonical: "/profile",
  },
};

/**
 * Server Component que verifica sesión antes de renderizar
 * El middleware ya protege la ruta, pero esta verificación adicional
 * asegura que tenemos la sesión disponible en el componente
 */
export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Si no hay sesión (aunque middleware debería haber redirigido),
  // redirigir a sign-in como fallback
  if (!session) {
    redirect("/sign-in?redirect=/profile");
  }

  return (
    <main>
      <UserProfile initialSession={session} />
    </main>
  );
}
