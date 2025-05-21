import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { CheckCircle, XCircle, X, Heart } from "lucide-react";

const MCQ = ({ question, onNext, totalQuestions, currentQuestionIndex }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [customInput, setCustomInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [hearts, setHearts] = useState(5);
  const navigate = useNavigate();
  const { seriesSlug, lessonId } = useParams();
  const { user } = useUser();

  useEffect(() => {
    setSelectedOption(null);
    setCustomInput("");
    setSubmitted(false);
    setFeedback("");
    setIsCorrect(null);
  }, [question]);

  // Fetch current hearts from the backend
  useEffect(() => {
    if (!user || !seriesSlug) return;

    fetch(`http://localhost:3001/api/series/${seriesSlug}/progress/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setHearts(data.hearts ?? 5);
      })
      .catch((err) => {
        console.error("Error fetching hearts:", err);
      });
  }, [user, seriesSlug]);

  const progressPercentage = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  const handleOptionClick = (opt) => {
    if (!submitted) {
      setSelectedOption(opt.text);
      setCustomInput("");

      if (opt.audio) {
        const audio = new Audio(opt.audio);
        audio.play().catch((err) => {
          console.warn("Autoplay blocked:", err.message);
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    const trimmedInput = customInput.trim();
    const userAnswer = trimmedInput || selectedOption;

    if (!userAnswer) {
      setFeedback("Select or type your answer first!");
      return;
    }

    const correctAnswer = question.correct;
    const language = typeof correctAnswer === "object" ? Object.keys(correctAnswer)[0] : "en";
    const correct = correctAnswer?.[language] || correctAnswer;

    const isCustomAnswer = question.allowCustomAnswer && trimmedInput.length > 0;

    // Determine correctness based on "anyOptionCorrect" flag
    const correctStatus = question.anyOptionCorrect || 
      isCustomAnswer || 
      userAnswer.trim().toLowerCase() === correct.trim().toLowerCase();

    if (correctStatus) {
      setFeedback("Nicely done!");
      setIsCorrect(true);
      setSubmitted(true);
    } else {
  setFeedback("Wrong! Please try again.");
  setIsCorrect(false);
  setSubmitted(true);

  const newHearts = Math.max(0, hearts - 1);
  setHearts(newHearts);

  // 🔥 Update in backend
  try {
    const res = await fetch(`http://localhost:3001/api/series/${seriesSlug}/progress/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        heartChange: -1,
      }),
    });

    // Optional: sync updated hearts
    const updated = await res.json();
    setHearts(updated.hearts ?? 0);

    // 🧘 Navigate to breathing page if hearts exhausted
    if ((updated.hearts ?? 0) <= 0) {
      navigate("/breathe");
      return;
    }
  } catch (err) {
    console.error("Failed to update hearts in DB:", err);
  }
}
  };

  const handleRetry = () => {
    setSubmitted(false);
    setSelectedOption(null);
    setCustomInput("");
    setFeedback("");
    setIsCorrect(null);
  };

  const handleClose = () => {
    navigate(-1); // Navigate to the previous page
  };

  if (!question || !question.options) {
    return <div className="text-center p-6 text-lg text-red-500">No question available!</div>;
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col overflow-hidden">
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 left-4 z-20 w-10 h-10 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
      >
        <X size={24} className="text-gray-600" />
      </button>

      {/* Progress Bar */}
      <div className="absolute top-16 left-4 right-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-gray-200 rounded-full h-4 shadow-md p-1 flex-1 mr-3">
            <div
              className="bg-gradient-to-r from-green-400 to-green-400 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex items-center gap-1 bg-white rounded-full px-3 py-2 shadow-md border border-red-100">
            <Heart size={20} className="text-red-500 fill-red-500" />
            <span className="text-red-500 font-bold">{hearts}</span>
          </div>
        </div>
      </div>

      {/* Content Area - Using flex-grow to take available space */}
      <div className="flex flex-col items-center justify-center flex-grow pt-28 px-4 pb-20 max-h-full">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">
          {typeof question.question === "object" ? question.question.en : question.question}
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl mx-auto">
          {(question.options || []).map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(opt)}
              className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 border-2 rounded-lg shadow-sm sm:shadow-md transition text-sm sm:text-base ${
                selectedOption === opt.text ? "border-green-500 bg-green-100" : "border-gray-300"
              }`}
            >
              {opt.image && (
                <img src={opt.image} alt="option" className="w-24 h-24 sm:w-16 sm:h-16 rounded-md" />
              )}
              <div className="font-semibold">{opt.text}</div>
            </button>
          ))}
        </div>

        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={!selectedOption && !customInput}
            className="mt-5 w-1/2 py-3 sm:py-4 bg-green-500 hover:border-green-600 text-white font-bold rounded-lg 
              disabled:opacity-50 text-sm sm:text-base border-b-4 border-green-800 
              active:translate-y-1 transition-all duration-150 mx-auto block"
          >
            Submit
          </button>
        )}
      </div>

      {/* Feedback Section - Fixed at bottom */}
      {feedback && (
        <div
          className={`fixed bottom-0 left-0 w-full z-50 p-4 flex items-center justify-between text-white font-semibold text-sm sm:text-lg rounded-t-xl shadow-lg ${
            isCorrect ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <div className="flex items-center gap-2">
            {isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
            {feedback}
          </div>
          {isCorrect ? (
            <button
              onClick={onNext}
              className="bg-white text-green-600 font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-full 
             border-b-4 border-green-600 active:translate-y-1 shadow-md 
             transition-all duration-150"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleRetry}
              className="bg-white text-red-600 font-bold py-1 sm:py-2 px-3 sm:px-4 rounded-full shadow-md"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MCQ;