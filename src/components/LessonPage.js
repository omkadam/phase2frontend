import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useLanguage } from "../context/LanguageContext";
import Rive from "@rive-app/react-canvas";

import MCQ from "./MCQ";
import MatchThePair from "./MatchThePair";
import Crossword from "./Crossword";
import BookReader from "./BookReader";
import ReadAloud from "./ReadAloud";
import Review from "./Review";

const LessonPage = () => {
  const { seriesSlug, lessonId } = useParams();
  const { user } = useUser();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [series, setSeries] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [userStats, setUserStats] = useState({ xp: 0, hearts: 0 });

  useEffect(() => {
    if (showCelebration) {
      const celebrationAudio = new Audio(
        "https://d16ho1g3lqitul.cloudfront.net/celebratenew.mp3"
      );
      celebrationAudio
        .play()
        .catch((err) =>
          console.warn("Celebration audio playback failed:", err)
        );
    }
  }, [showCelebration]);

  const currentQuestion = questions[currentQIndex];

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const seriesRes = await fetch(
        `http://localhost:3001/api/series/${seriesSlug}`
      );
      const seriesData = await seriesRes.json();
      setSeries(seriesData);

      const lessonRes = await fetch(
        `http://localhost:3001/api/series/${seriesSlug}/lesson/${lessonId}`
      );
      const lessonData = await lessonRes.json();
      setQuestions(lessonData.questions || []);

      // Fetch user stats
      const statsRes = await fetch(
        `http://localhost:3001/api/series/${seriesSlug}/progress/${user.id}`
      );
      const statsData = await statsRes.json();
      setUserStats({
        xp: statsData.xp || 0,
        hearts: statsData.hearts || 0
      });

      setLoading(false);
    };

    fetchData();
  }, [seriesSlug, lessonId, user]);

  const handleNext = async () => {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(currentQIndex + 1);

      await fetch(
        `http://localhost:3001/api/series/${seriesSlug}/progress/${user.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            lastCompletedQuestionIndex: currentQIndex,
            xpChange: 10,
            heartChange: 0,
          }),
        }
      );

      // Update local XP count
      setUserStats(prev => ({ ...prev, xp: prev.xp + 10 }));
    } else {
      // Show celebration screen when lesson completes
      setShowCelebration(true);

      const [unitNum, lessonNum] = lessonId
        .replace("lesson-", "")
        .split("-")
        .map(Number);

      let globalIndex = 0;
      for (let i = 0; i < unitNum - 1; i++) {
        globalIndex += series.units[i].lessons.length;
      }
      globalIndex += lessonNum - 1;

      const nextLessonGlobalIndex = globalIndex + 1;

      const response = await fetch(
        `http://localhost:3001/api/series/${seriesSlug}/progress/${user.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nextLessonGlobalIndex }),
        }
      );

      // Update user stats after lesson completion
      if (response.ok) {
        const updatedStats = await response.json();
        setUserStats({
          xp: updatedStats.xp || userStats.xp + 10,
          hearts: updatedStats.hearts || userStats.hearts
        });
      }
    }
  };

  if (loading)
    return (
      <div className="p-6 flex justify-center items-center min-h-screen bg-white">
        <img
          src="https://d16ho1g3lqitul.cloudfront.net/sochuloading.gif"
          alt="Loading..."
          className="w-48 h-48 object-contain"
        />
      </div>
    );

  if (!currentQuestion)
    return <div className="p-4 text-center">No more questions!</div>;

  const renderQuestion = () => {
    const { type } = currentQuestion;

    // Transform the pages to include both image and audio URLs
    const formattedPages = Array.isArray(currentQuestion.pages?.[language])
      ? currentQuestion.pages[language].map((page) => ({
          image: page.image,
          audio: page.audio,
          hardWords: page.hardWords || [],
          speakText: page.speakText || "",
        }))
      : [];

    const translatedQuestion = {
      ...currentQuestion,
      question:
        typeof currentQuestion.question === "object"
          ? currentQuestion.question?.[language]
          : currentQuestion.question,
      options: Array.isArray(currentQuestion.options)
        ? currentQuestion.options
        : currentQuestion.options?.[language],
      correct:
        typeof currentQuestion.correct === "object"
          ? currentQuestion.correct?.[language]
          : currentQuestion.correct,
      pages: formattedPages,
      audio:
        typeof currentQuestion.questionAudio === "object"
          ? currentQuestion.questionAudio?.[language]
          : currentQuestion.questionAudio || "",
    };

    switch (type) {
      case "mcq":
        return (
          <MCQ
            question={translatedQuestion}
            onNext={handleNext}
            totalQuestions={questions.length}
            currentQuestionIndex={currentQIndex}
          />
        );
      case "match-the-pair":
        return (
          <MatchThePair question={translatedQuestion} onNext={handleNext} />
        );
      case "crossword":
        return <Crossword question={translatedQuestion} onNext={handleNext} />;
      case "book":
        return (
          <BookReader pages={translatedQuestion.pages} onNext={handleNext} />
        );
      case "read-aloud":
        return <ReadAloud question={translatedQuestion} onNext={handleNext} />;
      case "review":
        return <Review question={translatedQuestion} onNext={handleNext} />;
      default:
        return <div>Unknown Question Type</div>;
    }
  };

  // Celebration Screen with Rive Animation
  const renderCelebration = () => {
    const lessonCompleteMessage = language === "hi" ? "लेसन पूरा हुआ!" : "Lesson Complete!";
    const totalXpLabel = language === "hi" ? "कुल XP" : "TOTAL XP";
    const heartsLabel = language === "hi" ? "दिल" : "HEARTS";
    const continueLabel = language === "hi" ? "CONTINUE" : "CONTINUE";

    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center text-center p-6">
        {/* Decorative sparkles */}
        <div className="absolute top-20 left-1/4 text-purple-400 text-2xl">✨</div>
        <div className="absolute top-32 right-1/4 text-purple-400 text-2xl">✨</div>

        {/* Rive Animation - Mr. Williams */}
        <div className="w-[300px] h-[300px] mb-8 flex items-center justify-center">
          <Rive
            src="/mr_williams (1).riv"
            stateMachines="State Machine 1"
            style={{
              width: "100%",
              height: "100%",
            }}
            onLoadError={(error) => {
              console.warn("Failed to load Rive animation: /mr_williams (1).riv", error);
            }}
          />
        </div>

        {/* Lesson Complete Title */}
        <h1 className="text-3xl font-bold text-yellow-500 mb-8">
          {lessonCompleteMessage}
        </h1>

        {/* Stats Cards */}
        <div className="flex gap-4 mb-12 w-full max-w-md">
          {/* Total XP Card */}
          <div className="flex-1 bg-white rounded-2xl border-2 border-yellow-400 p-4">
            <div className="bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">
              {totalXpLabel}
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6  rounded flex items-center justify-center">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">{userStats.xp}</span>
            </div>
          </div>

          {/* Hearts Card */}
          <div className="flex-1 bg-white rounded-2xl border-2 border-red-400 p-4">
            <div className="bg-red-400 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">
              {heartsLabel}
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">❤️</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">{userStats.hearts}</span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={() => {
            const audio = new Audio("/sounds/click.mp3");
            audio.play();
            navigate(`/learn/${seriesSlug}`);
          }}
          className="w-[100%] py-3 sm:py-4 bg-green-500 hover:border-green-600 text-white font-bold rounded-lg 
       disabled:opacity-50 text-sm sm:text-base border-b-4 border-green-600 
       active:translate-y-1 transition-all duration-150"
        >
          {continueLabel}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative">
      {showCelebration ? renderCelebration() : renderQuestion()}
    </div>
  );
};

export default LessonPage;