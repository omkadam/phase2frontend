import React, { useState, useEffect, useRef } from "react";
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

  // 🔧 Audio Management - Use refs to track all audio instances
  const activeAudioRef = useRef(null);
  const allAudioInstancesRef = useRef(new Set());

  // 🛑 CRITICAL: Stop all audio function
  const stopAllAudio = () => {
    // Stop the main question audio
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
      setIsAudioPlaying(false);
    }

    // Stop active audio ref
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }

    // Stop all tracked audio instances
    allAudioInstancesRef.current.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (error) {
        console.warn("Error stopping audio:", error);
      }
    });
    allAudioInstancesRef.current.clear();
  };

  // 🧹 Helper function to play audio safely with tracking
  const playAudioSafely = (audioSrc, onPlay = null, onEnd = null) => {
    // Stop any currently playing audio first
    stopAllAudio();

    const audio = new Audio(audioSrc);
    
    // Track this audio instance
    allAudioInstancesRef.current.add(audio);
    activeAudioRef.current = audio;

    // Set up event listeners
    audio.addEventListener('ended', () => {
      allAudioInstancesRef.current.delete(audio);
      if (activeAudioRef.current === audio) {
        activeAudioRef.current = null;
      }
      if (onEnd) onEnd();
    });

    audio.addEventListener('error', (e) => {
      console.warn('Audio playback error:', e);
      allAudioInstancesRef.current.delete(audio);
    });

    // Play the audio
    audio.play()
      .then(() => {
        if (onPlay) onPlay();
      })
      .catch((err) => {
        console.warn("Audio playback failed:", err);
        allAudioInstancesRef.current.delete(audio);
      });

    return audio;
  };

  // Reset state when question changes - DON'T STOP AUDIO HERE
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

  // 🔊 SIMPLE AUDIO AUTO-PLAY - BACK TO BASICS
  useEffect(() => {
    if (question.audio) {
      // Stop any existing audio first
      if (audioInstance) {
        audioInstance.pause();
        audioInstance.currentTime = 0;
      }

      const audio = new Audio(question.audio);
      setAudioInstance(audio);
      
      // JUST PLAY IT - NO COMPLEX LOGIC
      audio.play()
        .then(() => {
          setIsAudioPlaying(true);
        })
        .catch((err) => {
          console.warn("Audio autoplay failed:", err);
        });

      audio.addEventListener('ended', () => {
        setIsAudioPlaying(false);
      });

      // Cleanup
      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [question]);

  // 🧹 Component unmount cleanup
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const progressPercentage = Math.round(
    ((currentQuestionIndex + 1) / totalQuestions) * 100
  );

  const handleOptionClick = (opt) => {
    if (!submitted) {
      setSelectedOption(opt.text);
      setCustomInput("");

      // Play option audio if available - STOP OTHER AUDIO FIRST
      if (opt.audio) {
        if (audioInstance) {
          audioInstance.pause();
          setIsAudioPlaying(false);
        }
        
        const optionAudio = new Audio(opt.audio);
        optionAudio.play().catch((err) => {
          console.warn("Option audio failed:", err.message);
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    // 🛑 Stop all audio when user submits
    if (audioInstance) {
      audioInstance.pause();
      setIsAudioPlaying(false);
    }

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

      // 🎵 Play success audio with proper management
      playAudioSafely("/sounds/correct.wav");
    } else {
      setFeedback("Wrong! Please try again.");
      setIsCorrect(false);
      setSubmitted(true);

      // 🎵 Play error audio with proper management
      playAudioSafely("/sounds/error.wav");

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
          // 🛑 Stop all audio before navigation
          stopAllAudio();
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
    // 🛑 Stop all audio on retry
    stopAllAudio();
    
    setSubmitted(false);
    setSelectedOption(null);
    setCustomInput("");
    setFeedback("");
    setIsCorrect(null);
  };

  const handleClose = () => {
    // 🛑 CRITICAL: Stop all audio before navigation
    stopAllAudio();
    navigate(-1);
  };

  const handleNext = () => {
    // 🛑 CRITICAL: Stop all audio before moving to next question
    stopAllAudio();
    onNext();
  };

  // Auto-advance logic with proper audio cleanup
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        if (isCorrect) {
          handleNext(); // Use our audio-safe next function
        } else {
          handleRetry(); // Use our audio-safe retry function
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [submitted, isCorrect]);

  // 🔊 Handle speaker button - BACK TO ORIGINAL SIMPLE LOGIC
  const handleSpeakerToggle = () => {
    if (audioInstance) {
      if (isAudioPlaying) {
        audioInstance.pause();
        setIsAudioPlaying(false);
      } else {
        audioInstance.play()
          .then(() => setIsAudioPlaying(true))
          .catch((err) => console.warn("Manual play error:", err));
      }
    }
  };

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
            // 🛑 Stop all audio before playing click sound and navigating
            stopAllAudio();
            playAudioSafely("/sounds/click.mp3", null, () => handleClose());
          }}
          className="w-10 h-10 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
        >
          <X size={24} className="text-gray-600" />
        </button>
      </div>

      {/* 🔊 Speaker Button - BACK TO YOUR ORIGINAL DESIGN */}
      {question.audio && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={handleSpeakerToggle}
            className="w-10 h-10 hover:bg-white rounded-full flex items-center justify-center transition-colors bg-white"
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
          <div className="flex items-center gap-1 bg-white rounded-full px-3 py-2">
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
                // 🛑 Stop all audio before playing click sound and submitting
                stopAllAudio();
                playAudioSafely("/sounds/click.mp3", null, () => handleSubmit());
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
    </div>
  );
};

export default MCQ;