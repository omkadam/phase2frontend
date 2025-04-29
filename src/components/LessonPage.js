import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

import MCQ from "./MCQ";
import MatchThePair from "./MatchThePair";
import Crossword from "./Crossword";
import BookReader from "./BookReader";

const LessonPage = () => {
  const { seriesSlug, lessonId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();

  const [series, setSeries] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [loading, setLoading] = useState(true);

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
      const newIndex = currentQIndex + 1;
      setCurrentQIndex(newIndex);

      await fetch(`http://localhost:3001/api/series/${seriesSlug}/progress/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          lastCompletedQuestionIndex: newIndex - 1,
          xpChange: 10,
          heartChange: 0,
        }),
      });
    } else {
      // Lesson completed -> Unlock next lesson
      const [unitNum, lessonNum] = lessonId.replace('lesson-', '').split('-').map(Number);

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
