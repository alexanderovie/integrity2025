"use client";

import { supabase } from "@/app/supabase/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { Session } from "@supabase/supabase-js";

interface UserProfileProps {
  /**
   * Sesión inicial desde Server Component (Next.js 15 pattern)
   * Si se proporciona, evita fetch redundante en cliente
   */
  initialSession?: Session | null;
}

const UserProfile = ({ initialSession }: UserProfileProps = {}) => {
  // Estado inicial: usar datos del servidor si están disponibles
  const [session, setSession] = useState<Session | null>(initialSession || null);
  const [username, setUsername] = useState(
    initialSession?.user.user_metadata?.full_name || ""
  );
  const router = useRouter();

  // Patrón escalable: Server-First, Client-Fallback
  // - Si hay initialSession: usar datos del servidor (sin fetch)
  // - Si no hay initialSession: hacer fetch en cliente (fallback)
  // - Sincronizar cuando initialSession cambie (navegación SPA)
  useEffect(() => {
    if (initialSession) {
      // Tenemos datos del servidor: sincronizar estado directamente
      setSession(initialSession);
      const fullName = initialSession.user.user_metadata?.full_name || "";
      setUsername(fullName);
      return; // No hacer fetch, ya tenemos datos
    }

    // Fallback: obtener sesión en cliente (para uso standalone del componente)
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        const fullName = session.user.user_metadata?.full_name || "";
        setUsername(fullName);
      }
    };
    getSession();
  }, [initialSession]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = session?.user;
    if (!user) return alert("No active session");

    try {
      await supabase.auth.refreshSession();

      const { error: metaError } = await supabase.auth.updateUser({ data: { full_name: username } });
      if (metaError) throw metaError;

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert(`Update failed: ${errorMessage}`);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  return (
    <section>
      <div className="dark:bg-dark-gray">
        <div className="container ">
          <div className="pt-32 sm:pt-60 pb-16 sm:pb-28 w-full max-w-3xl mx-auto">
            <div className="bg-offwhite-warm dark:bg-secondary px-8 md:px-14 py-10 rounded-2xl flex flex-col gap-10">
              <div className="flex justify-between">
                <h1 className="text-2xl font-semibold">
                  User Profile | Manage Your Account Settings | Integrity
                </h1>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-10">
                <div className="w-30 h-30 md:w-60 md:h-60">
                  <Image src={"/images/avatar/avatar_1.jpg"} alt="user-profile" width={95} height={95} className="w-full h-full object-cover rounded-full" />
                </div>
                <div className="flex-1">
                  <form onSubmit={handleUpdate} className="flex flex-col gap-4 w-full">
                    <label htmlFor="profile-username" className="sr-only">Username</label>
                    <input
                      id="profile-username"
                      name="username"
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="input-field"
                      autoComplete="name"
                    />
                    <button
                      type="submit"
                      className="flex w-full px-5 py-3 font-medium cursor-pointer items-center justify-center transition duration-300 ease-in-out rounded-md bg-secondary dark:bg-white/25 text-white hover:text-primary"
                    >
                      Update Profile
                    </button>
                  </form>
                  <button onClick={() => handleSignOut()} className="flex w-full mt-2 px-5 py-3 font-medium cursor-pointer items-center justify-center transition duration-300 ease-in-out rounded-md bg-primary dark:bg-primary text-secondary">
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserProfile;
