import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useLanguage } from "../context/LanguageContext";
import { CircleArrowLeft, Play } from "lucide-react";

const BedtimeStories = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { language } = useLanguage();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBedtimeStories();
  }, []);

  const fetchBedtimeStories = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://sochu.online/api/series/bedtime-stories");
      
      if (!response.ok) {
        throw new Error("Failed to fetch stories");
      }
      
      const data = await response.json();
      setStories(data);
    } catch (error) {
      console.error("Error fetching bedtime stories:", error);
      setError("Failed to load bedtime stories");
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (storyId) => {
    navigate(`/bedtime-story/${storyId}`);
  };

  const handleFooterClick = (page) => {
    switch (page) {
      case "broadcasts":
        navigate("/learn");
        break;
      case "leaderboard":
        navigate("/leaderboard");
        break;
      case "entertainment":
        navigate("/episodes");
        break;
      case "learn":
        navigate("/setting");
        break;
      case "bedtime":
        navigate("/bedtime-stories")
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen bg-white">
        <img
          src="https://d16ho1g3lqitul.cloudfront.net/sochuloading.gif"
          alt="Loading..."
          className="w-48 h-48 object-contain"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-4 pb-32 px-4">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchBedtimeStories}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-4 pb-32 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-900 py-3 z-50">
        <div className="flex items-center gap-4">
          <CircleArrowLeft
            onClick={() => navigate("/learn")}
            className="text-gray-400 hover:text-white cursor-pointer"
            size={28}
          />
          <h1 className="text-white text-2xl font-bold">
            {language === "en" ? "Bedtime Stories" : "सोने की कहानियाँ"}
          </h1>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="space-y-4">
        {stories.map((story) => (
          <div
            key={story.storyId}
            onClick={() => handleStoryClick(story.storyId)}
            className="bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition-all duration-300 transform hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4">
              {/* Story Thumbnail */}
              <div className="relative">
                <img
                  src={story.storyThumbnail}
                  alt={story.storyName[language]}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
                  <Play className="text-white" size={24} />
                </div>
              </div>

              {/* Story Info */}
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-1">
                  {story.storyName[language]}
                </h3>
                <p className="text-gray-300 text-sm mb-2">
                  {story.aboutStory[language]}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{story.category[language]}</span>
                  {story.duration && <span>{story.duration}</span>}
                  {story.year && <span>{story.year}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {stories.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">
            {language === "en" ? "No Stories Available" : "कोई कहानी उपलब्ध नहीं"}
          </h3>
          <p className="text-gray-400">
            {language === "en" 
              ? "Check back later for new bedtime stories!" 
              : "नई सोने की कहानियों के लिए बाद में देखें!"
            }
          </p>
        </div>
      )}

      {/* Footer */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-gray-800 shadow-md p-2 pt-3 z-50"
        style={{ boxShadow: "0 -1px 4px rgba(0, 0, 0, 0.05)" }}
      >
        <div className="flex justify-around items-center text-gray-600 pb-3">
          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3");
              audio.play().catch(() => {}); // Ignore audio errors
              handleFooterClick("broadcasts");
            }}
            className="flex flex-col items-center text-white transition-colors"
          >
            <img
              src="/sochumenuunselectednew.png"
              alt="Learn"
              className="h-14 w-14"
            />
            <span className="text-xs">Learn</span>
          </button>
          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3");
              audio.play().catch(() => {});
              handleFooterClick("leaderboard");
            }}
            className="flex flex-col items-center text-white transition-colors"
          >
            <img
              src="/manjumenuunselectednew.png"
              alt="Leaderboard"
              className="h-14 w-14"
            />
            <span className="text-xs">Leaderboard</span>
          </button>
          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3");
              audio.play().catch(() => {});
              handleFooterClick("entertainment");
            }}
            className="flex flex-col items-center text-white transition-colors"
          >
            <img
              src="/rajumenuunselectednew.png"
              alt="Entertainment"
              className="h-14 w-14"
            />
            <span className="text-xs">Entertainment</span>
          </button>
          {/* <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3");
              audio.play().catch(() => {});
            }}
            className="flex flex-col items-center text-white transition-colors"
          >
            <div className="h-14 w-14 bg-gray-600 rounded-lg flex items-center justify-center mb-1">
              <span className="text-white text-xs">🌙</span>
            </div>
            <span className="text-xs">
              {language === "en" ? "Bedtime" : "सोना"}
            </span>
          </button> */}
          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3");
              audio.play().catch(() => {});
              handleFooterClick("bedtime");
            }}
            className="flex flex-col items-center text-white transition-colors"
          >
            <img
              src="/robermenuselected.png"
              alt="Bedtime"
              className="h-14 w-14"
            />
            <span className="text-xs">Bedtime</span>
          </button>
          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3");
              audio.play().catch(() => {});
              handleFooterClick("learn");
            }}
            className="flex flex-col items-center text-white transition-colors"
          >
            <img
              src="/anjumenuunselectednew.png"
              alt="Settings"
              className="h-14 w-14"
            />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BedtimeStories;