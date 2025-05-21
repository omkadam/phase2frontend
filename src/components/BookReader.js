import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { X, Mic } from "lucide-react";

const BookReader = ({ pages = [], onNext }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showDictionary, setShowDictionary] = useState(false);
  const [showSpeakPopup, setShowSpeakPopup] = useState(false);
  const [speechMatched, setSpeechMatched] = useState(false);

  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const touchStartX = useRef(null);

  const navigate = useNavigate();
  const { seriesSlug } = useParams();
  const { user } = useUser();

  const handleNextPage = () => {
    if (currentPage + 1 < pages.length) {
      setCurrentPage((prev) => prev + 1);
    } else {
      completeBook();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const completeBook = async () => {
    if (user) {
      await fetch(`http://localhost:3001/api/series/${seriesSlug}/progress/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xpChange: 10, heartChange: 0 }),
      });
      if (onNext) onNext();
    }
  };

  const handleClose = () => navigate(-1);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX.current;
    if (diff > 50) handlePrevPage();
    else if (diff < -50) handleNextPage();
  };

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    clickX < rect.width / 2 ? handlePrevPage() : handleNextPage();
  };

  const toggleAudio = () => {
    const newVal = !audioEnabled;
    setAudioEnabled(newVal);
    if (!newVal && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playAudioForCurrentPage();
    }
  };

  const toggleDictionary = () => setShowDictionary((prev) => !prev);
  const toggleSpeakPopup = () => {
    setShowSpeakPopup(true);
    setSpeechMatched(false);
  };

  const playAudioForCurrentPage = () => {
    const currentAudio = pages[currentPage]?.audio;
    if (audioRef.current && currentAudio && audioEnabled) {
      audioRef.current.src = currentAudio;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Autoplay error:", err);
          setIsPlaying(false);
        });
    }
  };

  useEffect(() => {
    if (audioEnabled) playAudioForCurrentPage();
    else {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [currentPage, audioEnabled]);

  const startRecognition = () => {
  let expected = pages[currentPage]?.speakText || "";

  // Normalize expected text
  expected = expected.toLowerCase().trim().replace(/[^\w\s]/gi, "");

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech recognition not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (e) => {
    let spoken = e.results[0][0].transcript || "";

    // Normalize spoken text
    spoken = spoken.toLowerCase().trim().replace(/[^\w\s]/gi, "");

    if (spoken === expected) {
      setSpeechMatched(true);
      setTimeout(() => {
        setShowSpeakPopup(false);
        setSpeechMatched(false);
      }, 1000);
    } else {
      alert("Try again! You said: " + spoken);
    }
  };

  recognition.onerror = (err) => {
    console.error("Recognition error:", err);
  };

  recognitionRef.current = recognition;
  recognition.start();
};

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      {/* Progress Bar */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-center gap-4">
        <div className="h-3 w-3/4 bg-white rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all rounded-full"
            style={{
              width: `${pages.length > 0 ? ((currentPage + 1) / pages.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Page Image */}
      <div
        className="w-full h-full flex items-center justify-center cursor-pointer select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <img
          src={pages[currentPage]?.image}
          alt={`Page ${currentPage + 1}`}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Mic Button - Open Speak Popup */}
      <button
        onClick={toggleSpeakPopup}
        className="absolute bottom-20 left-4 z-50 w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center transition-all duration-150 shadow-lg border-b-4 border-blue-600 active:translate-y-1 active:shadow-sm active:border-b-0"
      >
        <span className="text-white text-3xl font-bold">Y</span>
      </button>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute bottom-4 left-4 z-50 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center transition-all duration-150 shadow-lg border-b-4 border-yellow-600 active:translate-y-1 active:shadow-sm active:border-b-0"
      >
        <span className="text-black text-3xl font-bold">X</span>
      </button>

      {/* Dictionary Button */}
      <button
        onClick={toggleDictionary}
        className="absolute bottom-20 right-4 z-50 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center transition-all duration-150 shadow-lg border-b-4 border-red-900 active:translate-y-1 active:shadow-sm active:border-b-0"
      >
        <span className="text-white text-3xl font-bold">B</span>
      </button>

      {/* Dictionary Popup */}
      {showDictionary && (
        <div className="absolute top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg w-72 max-h-60 overflow-auto">
          <h3 className="text-lg text-center font-extrabold mb-2">Glossary</h3>
          {pages[currentPage]?.hardWords?.length > 0 ? (
            <ul>
              {pages[currentPage].hardWords.map((word, i) => (
                <li key={i} className="text-black mb-1">{word}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hard words for this page.</p>
          )}
          <button
            onClick={toggleDictionary}
            className="w-full mt-4 px-4 py-2 bg-yellow-400 border-b-2 border-yellow-600 text-black font-bold rounded-md hover:bg-yellow-500 text-center"
          >
            Close
          </button>
        </div>
      )}

      {/* Speak Popup */}
      {showSpeakPopup && (
  <div className="absolute top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-2xl w-80 max-h-72 overflow-auto text-center">
    {/* ❌ Close Button */}
    <div className="flex justify-end">
      <button
        onClick={() => setShowSpeakPopup(false)}
        className="text-gray-500 hover:text-black"
      >
        <X size={24} />
      </button>
    </div>

    <h3 className="text-lg font-bold mb-2">Say this:</h3>
    <p className="text-black text-xl font-semibold mb-4">
      {pages[currentPage]?.speakText || "No text"}
    </p>
    {speechMatched ? (
      <div className="text-green-500 text-4xl font-bold">👍</div>
    ) : (
      <button
        onClick={startRecognition}
        className="px-6 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 mt-2"
      >
        <Mic className="inline-block mr-2" /> Speak
      </button>
    )}
  </div>
)}

      {/* Audio Toggle (A) */}
      {pages[currentPage]?.audio && (
        <>
          <audio ref={audioRef} />
          <button
            onClick={toggleAudio}
            className={`absolute bottom-4 right-4 z-50 w-12 h-12 ${
              audioEnabled ? "bg-green-500 border-b-4 border-green-800" : "bg-green-300"
            } hover:bg-green-500 rounded-full flex items-center justify-center transition-all duration-150 shadow-lg active:translate-y-1 active:shadow-sm active:border-b-0`}
          >
            <span className="text-white text-3xl font-bold">A</span>
          </button>
        </>
      )}
    </div>
  );
};

export default BookReader;
