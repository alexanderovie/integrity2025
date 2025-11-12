import ForgotPassword from "@/components/Auth/ForgotPassword";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Gleamer",
};

const ForgotPasswordPage = () => {
  return (
    <>
      <ForgotPassword />
    </>
  );
};

export default ForgotPasswordPage;
