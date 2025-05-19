import React from "react";
import { Routes, Route } from "react-router-dom";
import WelcomeScreen from "./components/WelcomeScreen";
import LearnPage from "./components/LearnPage";
import { SignedIn, SignedOut, SignIn, RedirectToSignIn } from "@clerk/clerk-react";
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

function App() {
  return (
    <LanguageProvider> {/* ✅ Wrap your complete app */}
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />

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
      </Routes>
    </LanguageProvider>
  );
}

export default App;
