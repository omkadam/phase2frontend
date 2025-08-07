import React, { useEffect, useState } from "react";
import { SignedIn, SignedOut, useUser, useSignIn, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const WelcomeScreen = () => {
  const { user } = useUser();
  const { signIn, isLoaded } = useSignIn();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const checkFeeling = async () => {
      const res = await fetch(`http://localhost:3001/api/feeling/${user.id}`);
      const data = await res.json();

      const today = new Date().toISOString().split("T")[0];
      const alreadySubmitted = data.find((entry) => entry.date === today);

      if (alreadySubmitted) {
        navigate("/learn");
      } else {
        navigate("/feeling");
      }
    };

    checkFeeling();
  }, [user, navigate]);

  const handleAppleSignIn = async () => {
    try {
      // Method 1: Try direct Apple OAuth
      if (isLoaded && signIn) {
        // Create a new sign-in attempt first
        const signInAttempt = await signIn.create({
          strategy: "oauth_apple",
        });
        
        // Then redirect to Apple
        await signInAttempt.authenticateWithRedirect({
          redirectUrl: window.location.origin + "/sso-callback",
          redirectUrlComplete: "/learn"
        });
      }
    } catch (error) {
      console.error("Direct Apple OAuth failed:", error);
      
      // Method 2: Fallback to opening modal with Apple preselected
      console.log("Falling back to Clerk modal...");
      openSignIn({
        redirectUrl: window.location.origin + "/sso-callback"
      });
    }
  };

  const handleOtherSignIn = () => {
    // Open Clerk's sign-in modal with available providers
    openSignIn();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-10">
      <div className="flex flex-col md:flex-row items-center gap-10 max-w-5xl w-full">
        {/* Left side - Logo + Image */}
        <div className="flex flex-col items-center">
          <img
            src="/mainphoto.jpeg"
            alt="Sochu Logo"
            className="w-[250px] md:w-[300px] mb-4"
          />
        </div>

        {/* Right side - Text + Button */}
        <div className="text-center md:text-left space-y-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700">
            Let's celebrate the process of <br className="hidden md:block" />
            thinking and feeling!
          </h2>

          <SignedOut>
            <div className="space-y-4">
              {/* Single Sign In Button */}
              <button
                onClick={handleOtherSignIn}
                className="w-full bg-green-500 hover:bg-green-600 text-white active:border-b-0 font-bold py-3 px-6 rounded-xl shadow-md transition duration-200 border-b-4 border-green-600"
              >
                Continue Learning
              </button>
            </div>

            {/* Privacy Notice - Still important for compliance */}
            <div className="mt-4 text-xs text-gray-500 text-center max-w-md">
              <p>
                By signing in, you agree to our Terms of Service and Privacy Policy. 
                Multiple sign-in options available including Apple, which limits data collection 
                and allows you to keep your email private.
              </p>
            </div>
          </SignedOut>

          <SignedIn>
            <button className="bg-green-500 hover:bg-green-500 text-white active:border-b-0 font-bold py-3 px-6 rounded-xl shadow-md transition duration-200 border-b-4 border-green-600">
              Hello Sochu
            </button>
          </SignedIn>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;