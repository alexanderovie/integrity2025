import React from "react";
import Image from "next/image";
import { supabase } from "@/app/supabase/supabaseClient";

const SocialSignIn = ({ actionText = "Sign In" }) => {

    const handleOAuthLogin = async (provider: any) => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        if (error) console.error('OAuth login error:', error)
    }

    

    return (
        <div className="flex flex-col gap-4 md:flex-row md:flex items-center">
            <button onClick={() => handleOAuthLogin('google')}
                className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-md border border-sand-light dark:border-natural-gray/30 p-3 text-secondary dark:text-white duration-200 ease-in hover:bg-secondary/20 dark:hover:bg-white/10">
                {actionText}
                <Image src="/images/authicon/google-icon.svg" width={22} height={22} alt="google-icon" />
            </button>

            <button onClick={() => handleOAuthLogin('github')}
                className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-md border border-sand-light dark:border-natural-gray/30 p-3 text-secondary dark:text-white duration-200 ease-in hover:bg-secondary/20 dark:hover:bg-white/10">
                {actionText}
                <Image src="/images/authicon/github-icon.svg" width={22} height={22} alt="github-icon" />
            </button>
        </div>
    );
};

export default SocialSignIn;
