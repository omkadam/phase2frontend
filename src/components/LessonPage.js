import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useLanguage } from "../context/LanguageContext";

import MCQ from "./MCQ";
import MatchThePair from "./MatchThePair";
import Crossword from "./Crossword";
import BookReader from "./BookReader";
import ReadAloud from "./ReadAloud";

const LessonPage = () => {
  const { seriesSlug, lessonId } = useParams();
  const { user } = useUser();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [series, setSeries] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false); // Celebration state

  const currentQuestion = questions[currentQIndex];

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const seriesRes = await fetch(`http://localhost:3001/api/series/${seriesSlug}`);
      const seriesData = await seriesRes.json();
      setSeries(seriesData);

      const lessonRes = await fetch(`http://localhost:3001/api/series/${seriesSlug}/lesson/${lessonId}`);
      const lessonData = await lessonRes.json();
      setQuestions(lessonData.questions || []);
      setLoading(false);
    };

    fetchData();
  }, [seriesSlug, lessonId, user]);

  const handleNext = async () => {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(currentQIndex + 1);

      await fetch(`http://localhost:3001/api/series/${seriesSlug}/progress/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          lastCompletedQuestionIndex: currentQIndex,
          xpChange: 10,
          heartChange: 0,
        }),
      });
    } else {
      // Show celebration screen when lesson completes
      setShowCelebration(true);

      const [unitNum, lessonNum] = lessonId.replace("lesson-", "").split("-").map(Number);

      let globalIndex = 0;
      for (let i = 0; i < unitNum - 1; i++) {
        globalIndex += series.units[i].lessons.length;
      }
      globalIndex += lessonNum - 1;

      const nextLessonGlobalIndex = globalIndex + 1;

      await fetch(`http://localhost:3001/api/series/${seriesSlug}/progress/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextLessonGlobalIndex }),
      });
    }
  };

  if (loading) return <div className="p-4 text-center">Loading lesson...</div>;
  if (!currentQuestion) return <div className="p-4 text-center">No more questions!</div>;

  const renderQuestion = () => {
    const { type } = currentQuestion;

    const translatedQuestion = {
      ...currentQuestion,
      question: typeof currentQuestion.question === "object"
        ? currentQuestion.question?.[language]
        : currentQuestion.question,
      options: Array.isArray(currentQuestion.options)
        ? currentQuestion.options
        : currentQuestion.options?.[language],
      correct: typeof currentQuestion.correct === "object"
        ? currentQuestion.correct?.[language]
        : currentQuestion.correct,
      pages: currentQuestion.pages?.[language],
    };

    switch (type) {
      case "mcq":
        return <MCQ question={translatedQuestion} onNext={handleNext} totalQuestions={questions.length} currentQuestionIndex={currentQIndex} />;
      case "match-the-pair":
        return <MatchThePair question={translatedQuestion} onNext={handleNext} />;
      case "crossword":
        return <Crossword question={translatedQuestion} onNext={handleNext} />;
      case "book":
        return <BookReader pages={translatedQuestion.pages} onNext={handleNext} />;
      case "read-aloud":
        return <ReadAloud question={translatedQuestion} onNext={handleNext} />;
      default:
        return <div>Unknown Question Type</div>;
    }
  };

  // Celebration Screen
  const renderCelebration = () => (
  <div className="fixed inset-0 bg-white flex flex-col items-center justify-center text-center p-6">
    {/* Festive Banner */}
    <div className="w-full flex justify-center mb-4">
      <img 
        src="/sochuloop.gif" 
        alt="Celebration Banner" 
        className="w-3/4 max-w-md"
      />
    </div>

    {/* Character with Star Animation */}
    <div className="relative flex flex-col items-center justify-center mb-6">
      <div className="absolute top-0 animate-pulse">
        <img 
          src="/path/to/your/stars.png" 
          alt="Stars" 
          className="w-48 h-48"
        />
      </div>
      <div className="relative z-10">
        <img 
          src="/sochuloop.gif" 
          alt="Character" 
          className="w-36 h-36"
        />
      </div>
    </div>

    {/* Yippee Message */}
    <h2 className="text-3xl font-extrabold mb-2">Yippee!!!</h2>
    <p className="text-lg text-gray-600 mb-6">You've completed another one.<br />Keep going, you're doing great!</p>

    {/* Continue Button */}
    <button
      onClick={() => navigate(`/learn/${seriesSlug}`)}
      className="px-8 py-3 bg-yellow-400 text-black font-bold rounded-full shadow-md hover:bg-yellow-500 transition"
    >
      Continue
    </button>
  </div>
);

  return (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative">
    {showCelebration ? renderCelebration() : renderQuestion()}
  </div>
);
};

export default LessonPage;
