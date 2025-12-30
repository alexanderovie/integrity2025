"use client";
import { supabase } from "@/app/supabase/supabaseClient";
import Loader from "@/components/CommonComponents/Loader";
import Logo from "@/components/Layout/Header/Logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormErrors } from "@/lib/forms";
import { validateEmail, validateRequired, validateLength } from "@/lib/forms";
import { createEmptyErrors, clearFieldError } from "@/lib/forms";
import SocialSignIn from "../SocialSignIn";

interface LoginFormData {
  email: string;
  password: string;
}

const Signin = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  // Scalable error pattern: Record<string, string> - same as Stripe, Linear, Vercel
  const [validationErrors, setValidationErrors] = useState<FormErrors>(createEmptyErrors());

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/");
      }
    };
    checkSession();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Use reusable validators - enterprise-grade validation
    const emailError = validateEmail(loginData.email);
    if (emailError) newErrors.email = emailError;

    const passwordRequiredError = validateRequired(loginData.password, "Password");
    if (passwordRequiredError) {
      newErrors.password = passwordRequiredError;
    } else {
      const passwordLengthError = validateLength(loginData.password, 6, 128, "Password");
      if (passwordLengthError) newErrors.password = passwordLengthError;
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing - scalable pattern
    if (validationErrors[field]) {
      setValidationErrors(prev => clearFieldError(prev, field));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setValidationErrors(createEmptyErrors());

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        // Scalable error handling - add error without breaking type safety
        setValidationErrors(prev => ({
          ...prev,
          email: error.message || "Invalid email or password.",
        }));
        return;
      }

      router.push("/"); // Change this path to where you want to redirect
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="relative w-full pt-32 sm:pt-60 pb-16 sm:pb-28 flex items-center justify-center dark:bg-dark-gray">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="relative mx-auto max-w-lg overflow-hidden rounded-md bg-offwhite-warm dark:bg-secondary px-6 py-12 text-center sm:px-12 md:px-16">
                <div className="mb-10 flex justify-center">
                  <Logo />
                </div>
                <h1 className="text-3xl font-semibold text-secondary dark:text-white mb-6">Sign In to Your Account | Integrity Clean Solutions</h1>

                <SocialSignIn actionText="Sign In" />

                <span className="z-1 relative my-8 block text-center">
                  <span className="-z-1 absolute left-0 top-1/2 block h-px w-full bg-sand-light dark:bg-natural-gray/30"></span>
                  <span className="text-sm text-secondary/50 dark:text-white/40 relative z-10 inline-block bg-offwhite-warm dark:bg-secondary px-3">
                    OR
                  </span>
                </span>

                <form onSubmit={handleSubmit}>
                  <div className="mb-5 text-left">
                    <input
                      type="email"
                      placeholder="Email"
                      value={loginData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={`input-field ${validationErrors.email ? "border-red-500" : "border-stroke"} `}
                      autoComplete="email"
                    />
                    {validationErrors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="mb-5 text-left">
                    <input
                      type="password"
                      placeholder="Password"
                      value={loginData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      className={`input-field ${validationErrors.email ? "border-red-500" : "border-stroke"} `}
                      autoComplete="current-password"
                    />
                    {validationErrors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.password}
                      </p>
                    )}
                  </div>

                  <div className="mb-9">
                    <button
                      type="submit"
                      className="flex w-full px-5 py-3 font-medium cursor-pointer items-center justify-center transition duration-300 ease-in-out rounded-md bg-secondary dark:bg-white/25  text-white hover:text-primary"
                    >
                      {loading ? <Loader /> : "Sign In"}
                    </button>
                  </div>
                </form>

                <Link
                  href="/forgot-password"
                  className="mb-1 inline-block text-secondary/70 dark:text-white/70 hover:text-secondary dark:hover:text-white"
                >
                  Forgot Password?
                </Link>

                <p className="text-secondary/70 dark:text-white/70">
                  Not a member yet?{" "}
                  <Link
                    href="/sign-up"
                    className="text-secondary/70 dark:text-white/70 hover:text-secondary dark:hover:text-white"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signin;
