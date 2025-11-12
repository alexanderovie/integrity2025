"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/supabase/supabaseClient";
import SocialSignIn from "../SocialSignIn";
import Loader from "@/components/CommonComponents/Loader";
import Logo from "@/components/Layout/Header/Logo";

const Signin = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
  });

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

  const validateForm = () => {
    let errors = { email: "", password: "" };
    let isValid = true;

    if (!loginData.email) {
      errors.email = "Email is required.";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      errors.email = "Please enter a valid email address.";
      isValid = false;
    }

    if (!loginData.password) {
      errors.password = "Password is required.";
      isValid = false;
    } else if (loginData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setValidationErrors({ email: "", password: "" });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        setValidationErrors((prev) => ({
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
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      className={`input-field ${validationErrors.email ? "border-red-500" : "border-stroke"} `}
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
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      className={`input-field ${validationErrors.email ? "border-red-500" : "border-stroke"} `}
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
