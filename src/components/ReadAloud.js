// ✅ ReadAloud.js
import React, { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const ReadAloud = ({ question, onNext }) => {
  const { seriesSlug, lessonId } = useParams();
  const { user } = useUser();
  const { language } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  const textToRead =
    typeof question?.question === "object"
      ? question?.question?.[language]
      : question?.question || "";

  // 🧠 Debugging logs
  useEffect(() => {
    console.log("👀 ReadAloud Question:", question);
    console.log("📜 textToRead:", textToRead);
  }, [question, textToRead]);

  // 🎤 Setup SpeechRecognition with auto-restart
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      setIsRecording(false);
    };

    recognition.onerror = () => setIsRecording(false);

    recognition.onend = () => {
      if (isRecording) {
        console.log("🎙️ Auto-restarting recognition...");
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
  }, [language, isRecording]);

  const startRecording = () => {
    setTranscript("");
    setIsRecording(true);
    recognitionRef.current?.start();
  };

  const checkMatch = () => {
    const normalize = (str) =>
      str.trim().toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");
  
    const normalizedInput = normalize(transcript);
    const normalizedTarget = normalize(textToRead);
  
    console.log("🎯 Normalized Input:", normalizedInput);
    console.log("🎯 Normalized Target:", normalizedTarget);
  
    return normalizedInput === normalizedTarget;
  };

  const handleComplete = async () => {
    if (!user) return;
    if (checkMatch()) {
      await fetch(`http://localhost:3001/api/series/${seriesSlug}/progress/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          xpChange: 10,
          heartChange: 0,
        }),
      });
      onNext();
    } else {
      alert("🎤 Voice doesn't match the text. Try again bro!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
      <h2 className="text-xl font-bold mb-4">📖 Read Aloud</h2>
      <p className="text-lg text-gray-700 bg-gray-100 px-4 py-3 rounded shadow max-w-xl">
        {textToRead || "No text provided."}
      </p>

      <button
        onClick={startRecording}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
        disabled={isRecording}
      >
        {isRecording ? "Listening..." : "Start Speaking 🎙️"}
      </button>

      {transcript && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">Your Speech:</p>
          <p className="italic text-md text-black">"{transcript}"</p>
        </div>
      )}

      <button
        onClick={handleComplete}
        className="mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded"
        disabled={!transcript}
      >
        Submit 🥳
      </button>
    </div>
  );
};

export default ReadAloud;
