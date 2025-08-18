import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  CircleArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Shuffle,
  Share,
} from "lucide-react";

const StoryPlayer = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const audioRef = useRef(null);

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    fetchStory();
  }, [storyId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [story]);

  const fetchStory = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://sochu.online/api/series/bedtime-stories/${storyId}`
      );

      if (!response.ok) {
        throw new Error("Story not found");
      }

      const data = await response.json();
      setStory(data);
    } catch (error) {
      console.error("Error fetching story:", error);
      setError("Failed to load story");
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.min(audio.currentTime + 10, duration);
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(audio.currentTime - 10, 0);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex justify-center items-center bg-gray-900 overflow-hidden">
        <img
          src="https://d16ho1g3lqitul.cloudfront.net/sochuloading.gif"
          alt="Loading..."
          className="w-32 h-32 object-contain"
        />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="h-screen w-screen bg-gray-900 overflow-hidden flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-red-500 mb-4 text-lg">{error || "Story not found"}</p>
          <button
            onClick={() => navigate("/bedtime-stories")}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Stories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background Stars Effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <div
          className="absolute top-32 right-20 w-1 h-1 bg-white rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-64 left-32 w-1.5 h-1.5 bg-white rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-32 right-16 w-2 h-2 bg-white rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-64 left-20 w-1 h-1 bg-white rounded-full animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse"
          style={{ animationDelay: "3s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse"
          style={{ animationDelay: "2.5s" }}
        ></div>
      </div>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={story.audioLink && story.audioLink[language]}
        preload="metadata"
      />

      {/* Main Content Container - Fixed Height */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header - Fixed Height */}
        <div className="flex items-center justify-between px-4 py-4 flex-shrink-0">
          <CircleArrowLeft
            onClick={() => navigate("/bedtime-stories")}
            className="text-white hover:text-gray-300 cursor-pointer transition-colors"
            size={28}
          />
        </div>

        {/* Content Area - Flexible */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 max-h-full">
          {/* Story Cover Art - Constrained Size */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl bg-gray-800">
                <img
                  src={story.storyThumbnail}
                  alt={story.storyName && story.storyName[language]}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgdmlld0JveD0iMCAwIDMyMCAzMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMzIwIiBmaWxsPSIjNEI1NTYzIi8+Cjx0ZXh0IHg9IjE2MCIgeT0iMTcwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Q0E0QUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuKclCBTdG9yeSBJbWFnZTwvdGV4dD4KPC9zdmc+';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-3xl"></div>
              </div>
            </div>
          </div>

          {/* Story Info - Compact */}
          <div className="text-center mb-6 max-w-md">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 line-clamp-2">
              {story.storyName && story.storyName[language]}
            </h1>
            <p className="text-sm sm:text-base text-gray-300 mb-2 line-clamp-2">
              {story.aboutStory && story.aboutStory[language]}
            </p>
            <p className="text-xs sm:text-sm text-gray-400">
              {story.category && story.category[language]} • {story.year}
            </p>
          </div>

          {/* Progress Bar - Compact */}
          <div className="w-full max-w-md mb-6">
            <div
              className="w-full h-2 bg-white bg-opacity-20 rounded-full cursor-pointer"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{
                  width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-gray-300 mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls - Compact */}
          <div className="flex justify-center items-center gap-4">
            
            
            <button
              onClick={togglePlayPause}
              className="p-4 rounded-full bg-white bg-opacity-90 text-gray-900 hover:bg-white transition-all shadow-lg"
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} />}
            </button>
            
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryPlayer;