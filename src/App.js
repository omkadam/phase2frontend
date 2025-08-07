import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import WelcomeScreen from "./components/WelcomeScreen";
import LearnPage from "./components/LearnPage";
import {
  SignedIn,
  SignedOut,
  SignIn,
  RedirectToSignIn,
  useClerk,
} from "@clerk/clerk-react";
import SeriesScreen from "./components/SeriesScreen";
import SeriesDetail from "./components/SeriesDetails";
import LessonPage from "./components/LessonPage";
import BreathingPage from "./components/BreathingPage";
import FeelingPage from "./components/FeelingPage";
import MoodRadarChart from "./components/MoodRadarChart";
import { LanguageProvider } from "./context/LanguageContext"; // ✅ Import LanguageProvider
import BroadcastList from "./components/BroadcastList"; // Import BroadcastList
import Leaderboard from "./components/Leaderboard"; // Import Leaderboard
import Entertainment from "./components/Entertainment"; // Import Entertainment
import AdminPanel from "./components/AdminPanel"; // Import AdminPanel
import Setting from "./components/Settings";
import ParentingTest from "./components/ParentingTest";
import Wheel from "./components/Trying";
import Trying from "./components/Trying";
import PlanningsPage from "./components/PlanningsPage ";
import EpisodesComponent from "./components/EpisodesComponent";

// SSO Callback Component for Apple Sign In
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

function App() {
  return (
    <LanguageProvider>
      {" "}
      {/* ✅ Wrap your complete app */}
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route
          path="/sign-in/*"
          element={<SignIn routing="path" path="/sign-in" />}
        />

        {/* ✅ SSO Callback Route for Apple Sign In */}
        <Route path="/sso-callback" element={<SSOCallback />} />

        {/* ✅ Protected Feeling Page */}
        <Route
          path="/feeling"
          element={
            <>
              <SignedIn>
                <FeelingPage />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        {/* Protected Learn Page */}
        <Route
          path="/learn"
          element={
            <>
              <SignedIn>
                <SeriesScreen />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        {/* Protected Series Detail Page */}
        <Route
          path="/learn/:slug"
          element={
            <>
              <SignedIn>
                <SeriesDetail />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        {/* Protected Lesson Page */}
        <Route
          path="/lesson/:seriesSlug/:lessonId"
          element={
            <>
              <SignedIn>
                <LessonPage />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        {/* Protected Breathing Page */}
        <Route
          path="/breathe"
          element={
            <>
              <SignedIn>
                <BreathingPage />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        

        {/* Protected Emotion Radar Page */}
        <Route
          path="/emotion-radar"
          element={
            <>
              <SignedIn>
                <MoodRadarChart />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        {/* Broadcasts Page */}
        <Route
          path="/broadcasts"
          element={
            <>
              <SignedIn>
                <BroadcastList />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        {/* Leaderboard Page */}
        <Route
          path="/leaderboard"
          element={
            <>
              <SignedIn>
                <Leaderboard />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/setting"
          element={
            <>
              <SignedIn>
                <Setting />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        {/* Entertainment Page */}
        <Route
          path="/entertainment"
          element={
            <>
              <SignedIn>
                <Entertainment />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        {/* Admin Panel - Protected Route */}
        <Route
          path="/admin"
          element={
            <>
              <SignedIn>
                <AdminPanel />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/parenting-test"
          element={
            <>
              <SignedIn>
                <ParentingTest />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/trying"
          element={
            <>
              <SignedIn>
                <Trying />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/plannings"
          element={
            <>
              <SignedIn>
                <PlanningsPage  />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/episodes"
          element={
            <>
              <SignedIn>
                <EpisodesComponent />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </LanguageProvider>
  );
}

export default App;