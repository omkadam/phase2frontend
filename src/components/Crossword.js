import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const Crossword = ({ questions }) => {
  const { seriesSlug, lessonId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();

  // Prepare grid based on correct answers
  const [answers, setAnswers] = useState(
    questions.map(q => Array(q.correct.length).fill(""))
  );

  const handleChange = (val, wordIdx, letterIdx) => {
    const updated = [...answers];
    updated[wordIdx][letterIdx] = val.toUpperCase().slice(0, 1); // only 1 uppercase letter
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    let correct = 0;
    answers.forEach((word, idx) => {
      if (word.join("").toLowerCase() === questions[idx].correct.toLowerCase()) {
        correct++;
      }
    });

    alert(`You got ${correct} correct out of ${questions.length}`);

    if (correct === questions.length && user) {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <h2 className="text-2xl font-bold mb-6">🧩 Crossword Puzzle</h2>

      <div className="space-y-10">
        {questions.map((q, wordIdx) => (
          <div key={wordIdx} className="flex flex-col items-center">
            <p className="mb-2 text-gray-700 font-semibold">{q.question}</p>

            {/* Grid of inputs */}
            <div className="flex gap-2">
              {answers[wordIdx].map((letter, letterIdx) => (
                <input
                  key={letterIdx}
                  type="text"
                  value={letter}
                  onChange={(e) => handleChange(e.target.value, wordIdx, letterIdx)}
                  className="w-10 h-10 text-center text-lg font-bold border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                  maxLength={1}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={answers.some(word => word.includes(""))}
        className="bg-green-500 text-white mt-10 px-8 py-3 rounded-lg shadow hover:bg-green-600 disabled:opacity-50"
      >
        Submit
      </button>
    </div>
  );
};

export default Crossword;
