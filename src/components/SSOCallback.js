import React, { useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const SSOCallback = () => {
  const { handleRedirectCallback } = useClerk();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await handleRedirectCallback();
        navigate("/learn");
      } catch (error) {
        console.error("SSO Callback error:", error);
        navigate("/");
      }
    };

    handleCallback();
  }, [handleRedirectCallback, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default SSOCallback;