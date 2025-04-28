import React, { useEffect, useState } from "react";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const WelcomeScreen = () => {
  const { user } = useUser();
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
            <SignInButton className="bg-green-500 hover:bg-green-500 text-white active:border-b-0 font-bold py-3 px-6 rounded-xl shadow-md transition duration-200 border-b-4 border-green-600">
              Continue Learning
            </SignInButton>
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
