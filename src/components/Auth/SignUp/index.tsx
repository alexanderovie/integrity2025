"use client";
import { supabase } from "@/app/supabase/supabaseClient";
import Loader from "@/components/CommonComponents/Loader";
import Logo from "@/components/Layout/Header/Logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormErrors } from "@/lib/forms";
import { validateName, validateEmail, validateRequired, validateLength } from "@/lib/forms";
import { createEmptyErrors, clearFieldError } from "@/lib/forms";
import SocialSignIn from "../SocialSignIn";

interface SignUpFormData {
  username: string;
  email: string;
  password: string;
}

const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SignUpFormData>({
    username: "",
    email: "",
    password: "",
  });
  const router = useRouter();
  // Scalable error pattern: Record<string, string> - same as Stripe, Linear, Vercel
  const [errors, setErrors] = useState<FormErrors>(createEmptyErrors());

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Use reusable validators - enterprise-grade validation
    const nameError = validateName(formData.username, true);
    if (nameError) newErrors.username = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordRequiredError = validateRequired(formData.password, "Password");
    if (passwordRequiredError) {
      newErrors.password = passwordRequiredError;
    } else {
      const passwordLengthError = validateLength(formData.password, 6, 128, "Password");
      if (passwordLengthError) newErrors.password = passwordLengthError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof SignUpFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing - scalable pattern
    if (errors[field]) {
      setErrors(prev => clearFieldError(prev, field));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setErrors(createEmptyErrors());
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { full_name: formData.username },
      },
    });

    if (error) {
      // Scalable error handling - add error without breaking type safety
      setErrors(prev => ({ ...prev, submit: error.message }));
      setLoading(false);
    } else {
      router.push("/sign-in");
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
                <h1 className="text-3xl font-semibold text-secondary dark:text-white mb-6">Create Your Account | Integrity Clean Solutions Orlando</h1>

                <SocialSignIn actionText="Sign Up" />

                <span className="z-1 relative my-8 block text-center">
                  <span className="-z-1 absolute left-0 top-1/2 block h-px w-full bg-sand-light dark:bg-natural-gray/30"></span>
                  <span className="text-sm text-secondary/50 dark:text-white/40 relative z-10 inline-block bg-offwhite-warm dark:bg-secondary px-3">
                    OR
                  </span>
                </span>

                <form onSubmit={handleSignup}>
                  <div className="mb-4 text-left">
                    <label htmlFor="signup-name" className="sr-only">Full name</label>
                    <input
                      id="signup-name"
                      type="text"
                      placeholder="Name"
                      name="username"
                      value={formData.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      className={`input-field ${errors.username ? "border-red-500" : ""}`}
                      autoComplete="name"
                      aria-required="true"
                      aria-invalid={!!errors.username}
                      aria-describedby={errors.username ? "signup-name-error" : undefined}
                    />
                    {errors.username && (
                      <p id="signup-name-error" className="text-red-500 text-sm mt-1" role="alert">{errors.username}</p>
                    )}
                  </div>
                  <div className="mb-4 text-left">
                    <label htmlFor="signup-email" className="sr-only">Email address</label>
                    <input
                      id="signup-email"
                      type="email"
                      placeholder="Email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={`input-field ${errors.email ? "border-red-500" : ""}`}
                      autoComplete="email"
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "signup-email-error" : undefined}
                    />
                    {errors.email && (
                      <p id="signup-email-error" className="text-red-500 text-sm mt-1" role="alert">{errors.email}</p>
                    )}
                  </div>
                  <div className="mb-4 text-left">
                    <label htmlFor="signup-password" className="sr-only">Password</label>
                    <input
                      id="signup-password"
                      type="password"
                      placeholder="Password"
                      name="password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      className={`input-field ${errors.password ? "border-red-500" : ""}`}
                      autoComplete="new-password"
                      aria-required="true"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "signup-password-error" : undefined}
                    />
                    {errors.password && (
                      <p id="signup-password-error" className="text-red-500 text-sm mt-1" role="alert">{errors.password}</p>
                    )}
                  </div>
                  {errors.submit && (
                    <p className="text-red-500 text-sm mb-4" role="alert">{errors.submit}</p>
                  )}
                  <div className="mb-8">
                    <button
                      type="submit"
                      className="flex w-full px-5 py-3 font-medium cursor-pointer items-center justify-center transition duration-300 ease-in-out rounded-md bg-secondary dark:bg-white/25 text-white hover:text-primary"
                    >
                      {loading ? <Loader /> : "Sign Up"}
                    </button>
                  </div>
                </form>

                <div className="flex flex-col max-w-xs mx-auto gap-2">
                  <p className="text-secondary/70 dark:text-white/40">
                    By creating an account, you agree with our{" "}
                    <Link href="/privacy-policy" className="text-secondary/70 dark:text-white/40 hover:text-secondary dark:hover:text-white">
                      Privacy
                    </Link>{" "}
                    &{" "}
                    <Link href="/privacy-policy" className="text-secondary/70 dark:text-white/40 hover:text-secondary dark:hover:text-white">
                      Policy
                    </Link>.
                  </p>

                  <p className="text-secondary/70 dark:text-white/40">
                    Already have an account?
                    <Link href="/sign-in" className="text-secondary/70 dark:text-white/40 hover:text-secondary dark:hover:text-white">
                      {" "}Sign In
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
