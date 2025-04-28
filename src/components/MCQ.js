import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const MCQ = ({ question, onNext }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { seriesSlug, lessonId } = useParams();
  const { user } = useUser();

  // 🛠️ FIX: Reset selectedOption and submitted when new question comes
  useEffect(() => {
    setSelectedOption(null);
    setSubmitted(false);
  }, [question]);

  const handleOptionClick = (opt) => {
    if (!submitted) {
      setSelectedOption(opt);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption || !user) return;

    const isCorrect = selectedOption === question.correct;

    await fetch(`http://localhost:3001/api/series/${seriesSlug}/progress/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        xpChange: isCorrect ? 10 : 0,
        heartChange: isCorrect ? 0 : -1,
      }),
    }).then(async (res) => {
      const data = await res.json();
      if ((data.hearts ?? 0) <= 0) {
        setTimeout(() => {
          navigate("/breathe");
        }, 500);
      }
    });

    if (isCorrect) {
      alert("✅ Correct! +10 XP");
      setSubmitted(true);
      setTimeout(() => {
        if (onNext) onNext();
      }, 500);
    } else {
      alert("❌ Wrong! -1 Heart");
    }
  };

  if (!question || !question?.options) {
    return <div className="text-center p-6 text-lg text-red-500">No question available!</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <h2 className="text-2xl font-bold mb-8">🧠 Choose the Correct Option</h2>

      <div className="text-center text-xl font-semibold mb-8">
        {question.question}
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {(question.options || []).map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleOptionClick(opt)}
            className={`px-6 py-4 border-2 rounded-xl transition ${
              selectedOption === opt
                ? "border-green-500 bg-green-100"
                : "border-gray-300"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedOption || submitted}
        className="mt-10 px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg disabled:opacity-50"
      >
        Submit
      </button>
    </div>
  );
};

export default MCQ;
