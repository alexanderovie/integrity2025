import SignUp from "@/components/Auth/SignUp";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Sign Up | Gleamer",
};

const SignupPage = () => {
  return (
    <>
      <SignUp />
    </>
  );
};

export default SignupPage;
