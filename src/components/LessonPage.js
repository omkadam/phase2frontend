import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

// 🧩 Import custom UIs
import MCQ from "./MCQ";
import MatchThePair from "./MatchThePair";
import Crossword from "./Crossword";
import BookReader from "./BookReader";

const LessonPage = () => {
  const { seriesSlug, lessonId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentQuestion = questions[currentQIndex];

  useEffect(() => {
    if (!user) return;

    const fetchLesson = async () => {
      const res = await fetch(`http://localhost:3001/api/series/${seriesSlug}/lesson/${lessonId}`);
      const data = await res.json();
      setQuestions(data.questions || []);
      setLoading(false);
    };

    fetchLesson();
  }, [seriesSlug, lessonId, user]);

  const handleNext = async () => {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      // Lesson completed
      const currentLessonNumber = Number(lessonId?.split("-")[1]);
      const nextLessonIndex = currentLessonNumber;

      await fetch(`http://localhost:3001/api/series/${seriesSlug}/progress/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextLessonIndex }),
      });

      setTimeout(() => {
        navigate(`/learn/${seriesSlug}`);
      }, 1000);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading lesson...</div>;
  if (!currentQuestion) return <div className="p-4 text-center">No more questions!</div>;

  const renderQuestion = () => {
    const { type } = currentQuestion;

    switch (type) {
      case "mcq":
        return <MCQ question={currentQuestion} onNext={handleNext} />;
      case "match-the-pair":
        return <MatchThePair question={currentQuestion} onNext={handleNext} />;
      case "crossword":
        return <Crossword question={currentQuestion} onNext={handleNext} />;
      case "book":
        return <BookReader question={currentQuestion} onNext={handleNext} />;
      default:
        return <div>Unknown Question Type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      {renderQuestion()}
    </div>
  );
};

export default LessonPage;
