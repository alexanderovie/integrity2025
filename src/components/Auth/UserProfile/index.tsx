"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/app/supabase/supabaseClient";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const UserProfile = () => {
    const [session, setSession] = useState<any>(null);
    const [username, setUsername] = useState("");
    const [displayName, setDisplayName] = useState("");
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setSession(session);
                const fullName = session.user.user_metadata?.full_name || "";
                setUsername(fullName);
                setDisplayName(fullName);
            }
        };
        getSession();
    }, [pathname]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        const user = session?.user;
        if (!user) return alert("No active session");

        try {
            await supabase.auth.refreshSession();

            const { error: metaError } = await supabase.auth.updateUser({ data: { full_name: username } });
            if (metaError) throw metaError;

            setDisplayName(username);
            alert("Profile updated successfully!");
        } catch (err: any) {
            console.error("Update error:", err);
            alert(`Update failed: ${err.message}`);
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
                                <h5>
                                    Welcome, <span className="text-secondary dark:text-white capitalize font-bold">{displayName}</span>
                                </h5>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-10">
                                <div className="w-30 h-30 md:w-60 md:h-60">
                                    <Image src={"/images/avatar/avatar_1.jpg"} alt="user-profile" width={95} height={95} className="w-full h-full object-cover rounded-full" />
                                </div>
                                <div className="flex-1">
                                    <form onSubmit={handleUpdate} className="flex flex-col gap-4 w-full">
                                        <input
                                            type="text"
                                            placeholder="Username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="input-field"
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