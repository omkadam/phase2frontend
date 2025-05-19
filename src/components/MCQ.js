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
  const [hearts, setHearts] = useState(5); // New state for hearts
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
    const correctStatus = isCustomAnswer || userAnswer.trim().toLowerCase() === correct.trim().toLowerCase();

    if (correctStatus) {
      setFeedback("Nicely done!");
      setIsCorrect(true);
      setSubmitted(true);
    } else {
      setFeedback("Wrong! Please try again.");
      setIsCorrect(false);
      setSubmitted(true);
      // Decrease hearts when answer is wrong
      setHearts(prev => Math.max(0, prev - 1));
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
    navigate(-1); // Navigate to previous page
  };

  if (!question || !question.options) {
    return <div className="text-center p-6 text-lg text-red-500">No question available!</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white overflow-hidden relative">
      {/* Cross Button */}
      <button
        onClick={handleClose}
        className="fixed top-4 left-4 z-10 w-10 h-10  hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors "
      >
        <X size={24} className="text-gray-600" />
      </button>

      {/* Fixed Progress Bar with Hearts */}
      <div className="fixed top-14 left-4 right-4 z-10">
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

      <div className="flex flex-col items-center justify-center w-full mt-20">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {typeof question.question === "object" ? question.question.en : question.question}
        </h2>

        <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
          {(question.options || []).map((opt, idx) => {
            const value = typeof opt === "string" ? { text: opt } : opt;
            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(value)}
                className={`flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-lg shadow-md transition ${
                  selectedOption === value.text ? "border-green-500 bg-green-100" : "border-gray-300"
                }`}
              >
                {value.image && (
                  <img src={value.image} alt="option" className="w-16 h-16 rounded-md" />
                )}
                <div className="text-lg font-semibold">{value.text}</div>
              </button>
            );
          })}
        </div>

        {question.allowCustomAnswer && (
          <input
            type="text"
            placeholder="Or write your own answer"
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              setSelectedOption(null);
            }}
            className="mt-4 p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
          />
        )}

        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={!selectedOption && !customInput}
            className="mt-6 px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg disabled:opacity-50"
          >
            Submit
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`fixed bottom-0 left-0 w-full p-4 flex items-center justify-between text-white font-semibold text-lg rounded-t-xl transition-all ${
            isCorrect ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <CheckCircle size={24} className="text-white" />
            ) : (
              <XCircle size={24} className="text-white" />
            )}
            {feedback}
          </div>
          {isCorrect ? (
            <button
              onClick={() => {
                if (onNext) onNext();
              }}
              className="bg-white text-green-600 font-bold py-2 px-4 rounded-full shadow-lg"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleRetry}
              className="bg-white text-red-600 font-bold py-2 px-4 rounded-full shadow-lg"
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