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

function App() {
  return (
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

<Route
  path="/emotion-radar"
  element={
    <>
      <SignedIn><MoodRadarChart /></SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  }
/>
    </Routes>
  );
}

export default App;
