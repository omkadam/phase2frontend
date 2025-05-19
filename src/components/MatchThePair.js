import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const MatchThePair = ({ question, onNext }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate();
  const { seriesSlug, lessonId } = useParams();
  const { user } = useUser();

  const handleQuestionClick = (q) => {
    setSelectedQuestion(q);
  };

  const handleOptionClick = (opt) => {
    setSelectedOption(opt);
  };

  const handleMatch = async () => {
    if (selectedQuestion && selectedOption) {
      // Check if the correct answer is an array or a single string
      const correctAnswers = Array.isArray(question.correct)
        ? question.correct.map((ans) => ans?.toLowerCase().trim())
        : [question.correct?.toLowerCase().trim()];

      const isCorrect = correctAnswers.includes(selectedOption.text?.toLowerCase().trim());

      if (isCorrect) {
        alert("✅ Correct Match!");
        if (onNext) onNext(); // Move to next question
      } else {
        alert("❌ Wrong Match! -1 heart");
        if (user) {
          try {
            const res = await fetch(
              `http://localhost:3001/api/series/${seriesSlug}/progress/${user.id}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ xpChange: 0, heartChange: -1 }),
              }
            );
            const data = await res.json();
            if ((data.hearts ?? 0) <= 0) {
              setTimeout(() => {
                navigate("/breathe");
              }, 500);
            }
          } catch (error) {
            console.error("Error updating hearts:", error);
          }
        }
      }

      // Reset selections
      setSelectedQuestion(null);
      setSelectedOption(null);
    }
  };

  if (!question || !question.options) {
    return <div className="text-center p-6 text-lg text-red-500">No matching question available!</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <h2 className="text-2xl font-bold mb-6">🧠 Match the Pair</h2>

      <div className="flex gap-10 mb-8">
        {/* Left side - Question */}
        <div className="space-y-4">
          {(Array.isArray(question.question) ? question.question : [question.question]).map((q, index) => (
            <button
              key={index}
              onClick={() => handleQuestionClick(q)}
              className={`block px-6 py-3 rounded-xl border-2 ${
                selectedQuestion === q ? "border-blue-500 bg-blue-100" : "border-gray-300"
              }`}
            >
              {typeof q === "object" ? q.en : q}
            </button>
          ))}
        </div>

        {/* Right side - Options */}
        <div className="space-y-4">
          {(Array.isArray(question.options) ? question.options : [question.options]).map((opt, index) => {
            const value = typeof opt === "string" ? { text: opt } : opt;
            return (
              <button
                key={index}
                onClick={() => handleOptionClick(value)}
                className={`block px-6 py-3 rounded-xl border-2 ${
                  selectedOption?.text === value.text
                    ? "border-green-500 bg-green-100"
                    : "border-gray-300"
                }`}
              >
                <div className="font-medium">{value.text}</div>
                {value.image && (
                  <img src={value.image} alt="option" className="w-32 mt-2 rounded-md" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleMatch}
          disabled={!selectedQuestion || !selectedOption}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow disabled:opacity-50"
        >
          Match
        </button>
      </div>
    </div>
  );
};

export default MatchThePair;
