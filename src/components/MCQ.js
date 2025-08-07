import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  CheckCircle,
  XCircle,
  X,
  Heart,
  Speaker,
  Volume2,
  VolumeX,
} from "lucide-react";

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
  const [audioInstance, setAudioInstance] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // const [showStreakPopup, setShowStreakPopup] = useState(false);

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

    fetch(`https://sochu.online/api/series/${seriesSlug}/progress/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setHearts(data.hearts ?? 5);
      })
      .catch((err) => {
        console.error("Error fetching hearts:", err);
      });
  }, [user, seriesSlug]);

  useEffect(() => {
    if (question.audio) {
      const audio = new Audio(question.audio);
      setAudioInstance(audio);

      if (audioEnabled) {
        audio.play().catch((err) => console.warn("Auto play failed:", err));
        setIsAudioPlaying(true);
      }

      // Cleanup on unmount
      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [question.audio, audioEnabled]);

  // useEffect(() => {
  //   if (showStreakPopup) {
  //     const clapSound = new Audio("/sounds/trump.mp3");
  //     clapSound.play().catch((err) => {
  //       console.warn("Clap sound failed:", err.message);
  //     });

  //     const timeout = setTimeout(() => {
  //       setShowStreakPopup(false);
  //     }, 3000);

  //     return () => clearTimeout(timeout);
  //   }
  // }, [showStreakPopup]);

  const progressPercentage = Math.round(
    ((currentQuestionIndex + 1) / totalQuestions) * 100
  );

  const handleOptionClick = (opt) => {
    if (!submitted) {
      setSelectedOption(opt.text);
      setCustomInput("");

      if (audioEnabled && opt.audio) {
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
    const language =
      typeof correctAnswer === "object" ? Object.keys(correctAnswer)[0] : "en";
    const correct = correctAnswer?.[language] || correctAnswer;

    const isCustomAnswer =
      question.allowCustomAnswer && trimmedInput.length > 0;

    // Determine correctness based on "anyOptionCorrect" flag
    const correctStatus =
      question.anyOptionCorrect ||
      isCustomAnswer ||
      userAnswer.trim().toLowerCase() === correct.trim().toLowerCase();

    if (correctStatus) {
      setFeedback("Nicely done!");
      setIsCorrect(true);
      setSubmitted(true);

      // 🎵 Play success audio for correct answer
      const successAudio = new Audio("/sounds/correct.wav");
      successAudio.play().catch((err) => {
        console.warn("Success audio playback failed:", err.message);
      });

      // setCorrectStreak((prev) => {
      //   const newStreak = prev + 1;
      //   if (newStreak === 3) {
      //     setShowStreakPopup(true);
      //     setTimeout(() => setShowStreakPopup(false), 3000);
      //     return 0;
      //   }
      //   return newStreak;
      // });
    } else {
      setFeedback("Wrong! Please try again.");
      setIsCorrect(false);
      setSubmitted(true);

      // 🎵 Play error audio for wrong answer
      const errorAudio = new Audio("/sounds/error.wav");
      errorAudio.play().catch((err) => {
        console.warn("Error audio playback failed:", err.message);
      });

      const newHearts = Math.max(0, hearts - 1);
      setHearts(newHearts);

      // 🔥 Update in backend
      try {
        const res = await fetch(
          `https://sochu.online/api/series/${seriesSlug}/progress/${user.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              heartChange: -1,
            }),
          }
        );

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
      setCorrectStreak(0);
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

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        if (isCorrect) {
          onNext(); // Move to the next question
        } else {
          handleRetry(); // Reset for retry
        }
      }, 1000); // 1 second

      return () => clearTimeout(timer);
    }
  }, [submitted, isCorrect]);

  if (!question || !question.options) {
    return (
      <div className="text-center p-6 text-lg text-red-500">
        No question available!
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col overflow-hidden">
      {/* Top Controls: Close + Speaker */}
      {/* ❌ Close Button - Top Left */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => {
            const audio = new Audio("/sounds/click.mp3");
            audio.play();
            handleClose();
          }}
          className="w-10 h-10 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
        >
          <X size={24} className="text-gray-600" />
        </button>
      </div>

      {/* 🔊 Speaker Button - Top Right */}
      {question.audio && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => {
              if (audioInstance) {
                if (isAudioPlaying) {
                  audioInstance.pause();
                  setIsAudioPlaying(false);
                } else {
                  audioInstance
                    .play()
                    .catch((err) => console.warn("Manual play error:", err));
                  setIsAudioPlaying(true);
                }
              }
              setAudioEnabled(!audioEnabled); // toggle user preference
            }}
            className={`w-10 h-10 hover:bg-white rounded-full flex items-center justify-center transition-colors ${
              isAudioPlaying ? "bg-white" : "bg-white"
            }`}
          >
            {isAudioPlaying ? (
              <Volume2 size={24} className="text-gray-700" />
            ) : (
              <VolumeX size={24} className="text-gray-700" />
            )}
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute top-16 left-4 right-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-gray-200 rounded-full h-4 shadow-md p-1 flex-1 mr-3">
            <div
              className="bg-gradient-to-r from-green-400 to-green-400 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex items-center gap-1 bg-white rounded-full px-3 py-2  ">
            <Heart size={20} className="text-red-500 fill-red-500" />
            <span className="text-red-500 font-bold">{hearts}</span>
          </div>
        </div>
      </div>

      {/* Content Area - Scrollable content with proper spacing */}
      <div className="flex-1 pt-28 pb-20 px-4 overflow-y-auto">
        <div className="flex flex-col items-center min-h-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">
            {typeof question.question === "object"
              ? question.question.en
              : question.question}
          </h2>

          {/* Question Image - Only show if question.image exists */}
          {question.image && (
            <div className="mb-6 flex justify-center">
              <img
                src={question.image}
                alt="Question illustration"
                className="max-w-full h-auto max-h-[240px] sm:max-h-48 rounded-lg object-contain"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl mx-auto mb-6">
            {(question.options || []).map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionClick(opt)}
                className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 border-2 rounded-lg shadow-sm sm:shadow-md transition text-sm sm:text-base ${
                  selectedOption === opt.text
                    ? "border-green-500 bg-green-100"
                    : "border-gray-300"
                }`}
              >
                {opt.image && (
                  <img
                    src={opt.image}
                    alt="option"
                    className="w-25 h-25 sm:w-16 sm:h-16 rounded-md object-cover"
                  />
                )}
                <div className="font-semibold text-center">{opt.text}</div>
              </button>
            ))}
          </div>

          {!submitted && (
            <button
              onClick={() => {
                const audio = new Audio("/sounds/click.mp3"); // ✅ Ensure this path exists in public folder
                audio.play();
                handleSubmit();
              }}
              disabled={!selectedOption && !customInput}
              className="w-[100%] py-3 sm:py-4 bg-green-500 hover:border-green-600 text-white font-bold rounded-lg 
       disabled:opacity-50 text-sm sm:text-base border-b-4 border-green-600 
       active:translate-y-1 transition-all duration-150"
            >
              Submit
            </button>
          )}
        </div>
      </div>

      {/* Feedback Section - Fixed at bottom */}
      {feedback && (
        <div
          className={`fixed bottom-0 left-0 w-full z-50 p-4 flex items-center justify-center text-white font-semibold text-sm sm:text-lg rounded-t-xl shadow-lg ${
            isCorrect ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <div className="flex items-center gap-2">
            {isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
            {feedback}
          </div>
        </div>
      )}
      {/* {showStreakPopup && (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-4 transition-all duration-300">
          <img
            src="/raju.gif" // ✅ Update path if needed
            alt="Streak Animation"
            className="w-64 sm:w-72 md:w-80 h-auto object-contain mb-6"
          />
          <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800">
            🎉 3 in a row! You're on fire 🔥
          </h2>
        </div>
      )} */}
    </div>
  );
};

export default MCQ;
