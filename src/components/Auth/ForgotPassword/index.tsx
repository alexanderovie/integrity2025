"use client";
import Loader from "@/components/CommonComponents/Loader";
import Logo from "@/components/Layout/Header/Logo";
import { supabase } from "@/app/supabase/supabaseClient";
import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loader, setLoader] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Function to validate email
  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("Email is required.");
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError("Invalid email format.");
      return false;
    }
    setEmailError(""); // Clear error if valid
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;

    setLoader(true);
    setEmailError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setEmailError(error.message || "Failed to send reset email. Please try again.");
        setLoader(false);
        return;
      }

      setIsEmailSent(true);
    } catch (error) {
      console.error("Password reset error:", error);
      setEmailError("An unexpected error occurred. Please try again.");
    } finally {
      setLoader(false);
    }
  };

  return (
    <section>
      <div className="relative w-full pt-32 sm:pt-60 pb-16 sm:pb-28 flex items-center justify-center dark:bg-dark-gray">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="relative shadow-lg mx-auto max-w-lg overflow-hidden rounded-lg bg-creamwhite dark:bg-secondary px-8 py-14 text-center sm:px-12 md:px-16">
                <div className="mb-10 flex justify-center">
                  <Logo />
                </div>
                <h1 className="text-3xl font-semibold text-secondary dark:text-white mb-6">Reset Your Password | Integrity Clean Solutions Account</h1>

                {isEmailSent ? (
                  <div className="flex flex-col items-center gap-2">
                    <h2 className="text-2xl font-semibold text-secondary dark:text-white">
                      Check Your Email
                    </h2>
                    <p className="text-secondary/60 dark:text-white/60 text-center">
                      We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions to reset your password.
                    </p>
                    <p className="text-secondary/60 dark:text-white/60 text-center text-sm mt-2">
                      If you don't see the email, please check your spam folder.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} role="form" aria-label="Password reset form">
                    <div className="mb-5 text-left">
                      <label htmlFor="forgot-email" className="sr-only">Email address</label>
                      <input
                        id="forgot-email"
                        type="email"
                        placeholder="Email"
                        name="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          validateEmail(e.target.value);
                        }}
                        required
                        className="input-field"
                        aria-required="true"
                        aria-invalid={!!emailError}
                        aria-describedby={emailError ? "forgot-email-error" : undefined}
                      />
                      {emailError && (
                        <p id="forgot-email-error" className="text-red-500 text-sm mt-1" role="alert">{emailError}</p>
                      )}
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="flex w-full px-5 py-3 font-medium cursor-pointer items-center justify-center transition duration-300 ease-in-out rounded-md bg-secondary dark:bg-white/25 hover:bg-creamwhite text-white hover:text-primary"
                        disabled={loader}
                      >
                        {loader ? <Loader /> : "Send Email"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
