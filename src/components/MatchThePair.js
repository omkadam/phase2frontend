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

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleMatch = () => {
    if (selectedQuestion && selectedOption) {
      if (selectedOption === question.correct) {
        alert("✅ Correct Match!");
        if (onNext) onNext(); // move to next question
      } else {
        alert("❌ Wrong Match! -1 heart");

        if (user) {
          fetch(`http://localhost:3001/api/series/${seriesSlug}/progress/${user.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              xpChange: 0,
              heartChange: -1,
            }),
          }).then(async (res) => {
            const data = await res.json();
            if ((data.hearts ?? 0) <= 0) {
              setTimeout(() => {
                navigate("/breathe");
              }, 500);
            }
          });
        }
      }
      setSelectedQuestion(null);
      setSelectedOption(null);
    }
  };

  if (!question || !question?.options) {
    return <div className="text-center p-6 text-lg text-red-500">No matching question available!</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <h2 className="text-2xl font-bold mb-6">🧠 Match the Pair</h2>

      <div className="flex gap-10 mb-8">
        {/* Left side - Question */}
        <div className="space-y-4">
          <button
            onClick={() => handleQuestionClick(question)}
            className={`block px-6 py-3 rounded-xl border-2 ${
              selectedQuestion ? "border-blue-500 bg-blue-100" : "border-gray-300"
            }`}
          >
            {question.question}
          </button>
        </div>

        {/* Right side - Options */}
        <div className="space-y-4">
          {(question.options || []).map((opt, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(opt)}
              className={`block px-6 py-3 rounded-xl border-2 ${
                selectedOption === opt
                  ? "border-green-500 bg-green-100"
                  : "border-gray-300"
              }`}
            >
              {opt}
            </button>
          ))}
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
