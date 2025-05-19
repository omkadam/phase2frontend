import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useLanguage } from "../context/LanguageContext";
import LanguageModal from "./LanguageModal";
import BroadcastList from "./BroadcastList";
import XPProfileForm from "./XPProfileForm";
import Leaderboard from "./Leaderboard";
import Entertainment from "./Entertainment";
import { Speaker, Trophy, Music2 } from "lucide-react";

const SeriesDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { language } = useLanguage();

  const [series, setSeries] = useState(null);
  const [unlockedLessons, setUnlockedLessons] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [xp, setXp] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [selected, setSelected] = useState("broadcasts");

  const handleFooterClick = (page) => {
    setSelected(page);
    switch (page) {
      case "broadcasts":
        navigate("/learn");
        break;
      case "leaderboard":
        navigate("/leaderboard");
        break;
      case "entertainment":
        navigate("/broadcasts");
        break;
      case "learn":
        navigate("/setting");
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (!user) return;

    fetch(`http://localhost:3001/api/series/${slug}`)
      .then((res) => res.json())
      .then((data) => setSeries(data));

    fetch(`http://localhost:3001/api/series/${slug}/progress/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setUnlockedLessons(data.unlockedLessons ?? [0]);
        setIsSubscribed(data.isSubscribed ?? false);
        setXp(data.xp ?? 0);
        setHearts(data.hearts ?? 5);
      });

    fetch(`http://localhost:3001/api/user-profile/${user.id}`)
      .then((res) => {
        if (res.status === 200) setHasProfile(true);
      })
      .catch(() => {});
  }, [slug, user]);

  useEffect(() => {
    if (xp >= 100 && !showProfilePopup && !hasProfile) {
      setShowProfilePopup(true);
    }
  }, [xp, showProfilePopup, hasProfile]);

  // Character images for Duolingo-style design
  const characterImages = [
    "/sochuloop.gif",
    // "/raju.gif",
    // "/sochuloop.gif",
    // "/sochuloop.gif",
    // "/sochuloop.gif",
    // "/sochuloop.gif",
  ];

  if (!series) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white pt-4 pb-32 px-4 overflow-x-hidden relative">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-white py-3 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/learn")} className="text-2xl">←</button>
          <img
            src="https://d16ho1g3lqitul.cloudfront.net/india.svg"
            alt="lang"
            className="w-7 h-7 cursor-pointer"
            onClick={() => setShowLangModal(true)}
          />
        </div>
        <div className="flex items-center gap-3 text-sm font-bold">
          <span className="text-orange-500">⚡ {xp}</span>
          <span className="text-red-500">❤️ {hearts}</span>
        </div>
      </div>

      {series.units.map((unit, unitIndex) => {
        const canAccessUnit = isSubscribed || unitIndex === 0;
        return (
          <div key={unitIndex} className="mb-12">
            <div className="bg-[#009aef] text-white rounded-xl px-6 py-5 flex justify-between items-center shadow-lg mb-6">
              <div>
                <h2 className="text-xl font-bold">{unit.title?.[language]}</h2>
                <p className="text-sm opacity-90">{unit.subtitle?.[language]}</p>
              </div>
              <img src={unit.image} alt="Unit" className="w-14 h-14 rounded-lg object-cover" />
            </div>
            <div className="relative flex flex-col items-center">
              {unit.lessons.map((lesson, lessonIndex) => {
                const rightShift = Math.sin(lessonIndex * Math.PI / 3) * 50;
                const nextRightShift = lessonIndex < unit.lessons.length - 1 ? Math.sin((lessonIndex + 1) * Math.PI / 3) * 50 : rightShift;
                
                let globalIndex = 0;
                for (let i = 0; i < unitIndex; i++) {
                  globalIndex += series.units[i].lessons.length;
                }
                globalIndex += lessonIndex;
                const isUnlocked = unlockedLessons.includes(globalIndex);
                
                // Check if lesson is completed (assuming any lesson with index < current unlocked is completed)
                const isCompleted = globalIndex < Math.max(...unlockedLessons);
                
                // Character appears only at specific curve points - now only checking forward curve
                let shouldShowCharacter = false;
                let characterPosition = 0;
                let characterDirection = 1;
                
                // Show character only at alternate curve points to avoid overlapping
                if (lessonIndex < unit.lessons.length - 1) {
                  const currentShift = rightShift;
                  const isCurvePoint = Math.abs(nextRightShift - currentShift) > 30;
                  
                  // Show character only at specific intervals (e.g., every 3rd curve point)
                  if (isCurvePoint && lessonIndex % 3 === 0) {
                    shouldShowCharacter = true;
                    
                    if (nextRightShift < currentShift) {
                      // Curve going left, character appears in right vacant space
                      characterPosition = currentShift + 90;
                      characterDirection = -1; // Face left
                    } else {
                      // Curve going right, character appears in left vacant space
                      characterPosition = currentShift - 110;
                      characterDirection = 1; // Face right
                    }
                  }
                }
                
                const characterIndex = Math.floor(globalIndex / 5) % characterImages.length;
                
                return (
                  <div key={lessonIndex} className="relative flex justify-center w-full" style={{ marginTop: lessonIndex === 0 ? 0 : 24 }}>
                    {/* Character Image - only one at a time */}
                    {shouldShowCharacter && (
                      <div 
                        className="absolute top-8 z-10"
                        style={{ 
                          transform: `translateX(${characterPosition}px)`,
                          width: '180px',
                          height: '180px',
                        }}
                      >
                        <img
                          src={characterImages[characterIndex]}
                          alt={`Character ${characterIndex + 1}`}
                          className="w-full h-full object-contain"
                          style={{
                            transform: `scaleX(${characterDirection})`,
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Lesson Button with flat design */}
                    <button
                      disabled={!canAccessUnit || !isUnlocked}
                      onClick={() => navigate(`/lesson/${slug}/lesson-${unitIndex + 1}-${lessonIndex + 1}`)}
                      className="relative transition-all duration-200 z-20"
                      style={{ transform: `translateX(${rightShift}px)` }}
                    >
                      {/* Button Shadow/Base - acts as bottom border */}
                      <div 
                        className={`w-[70px] h-[70px] rounded-full absolute top-1 ${
                          canAccessUnit && isUnlocked 
                            ? (isCompleted ? "bg-yellow-600" : "bg-yellow-600") 
                            : "bg-gray-500"
                        }`}
                      />
                      
                      {/* Main Button - flat design without borders */}
                      <div 
                        className={`w-[70px] h-[70px] rounded-full flex items-center justify-center text-white font-bold text-xl relative transition-all ${
                          canAccessUnit && isUnlocked 
                            ? (isCompleted 
                                ? "bg-yellow-400 hover:scale-105 active:translate-y-1" 
                                : "bg-yellow-400 hover:scale-105 active:translate-y-1"
                              )
                            : "bg-gray-300 cursor-not-allowed"
                        }`}
                      >
                        {isCompleted ? (
                          <img 
                            src="https://d16ho1g3lqitul.cloudfront.net/done2.svg" 
                            alt="Completed" 
                            className="w-12 h-12"
                          />
                        ) : (
                          <img 
                            src="https://d16ho1g3lqitul.cloudfront.net/star2.svg" 
                            alt="Not completed" 
                            className="w-8 h-8"
                          />
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {!isSubscribed && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center items-center px-6">
          <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white p-6 rounded-2xl shadow-2xl w-full max-w-md text-center animate-pulse">
            <div className="text-2xl font-bold mb-2">🚀 Unlock All Units!</div>
            <div className="text-sm opacity-90 mb-4">Subscribe now and continue your journey!</div>
            <button className="mt-2 bg-white text-pink-600 font-bold py-2 px-6 rounded-full shadow-md hover:bg-pink-100 transition">Subscribe 🚀</button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md p-2 pt-2 z-50 border-t-2"> 
        <div className="flex justify-around items-center text-gray-600">
          <button
            onClick={() => handleFooterClick("broadcasts")}
            className={`flex flex-col items-center ${
              selected === "broadcasts" ? "text-blue-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "broadcasts"
                  ? "/sochumenuselectednew.png"
                  : "/sochumenuunselectednew.png"
              }
              alt="Broadcast"
              className="h-14 w-14"
            />
            <span className="text-xs">Dashboard</span>
          </button>

          <button
            onClick={() => handleFooterClick("leaderboard")}
            className={`flex flex-col items-center ${
              selected === "leaderboard" ? "text-yellow-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "leaderboard"
                  ? "/manjumenuselectednew.png"
                  : "/manjumenuunselectednew.png"
              }
              alt="Leaderboard"
              className="h-14 w-14"
            />
            <span className="text-xs">Leaderboard</span>
          </button>

          <button
            onClick={() => handleFooterClick("entertainment")}
            className={`flex flex-col items-center ${
              selected === "entertainment" ? "text-green-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "entertainment"
                  ? "/rajumenuselectednew.png"
                  : "/rajumenuunselectednew.png"
              }
              alt="Entertainment"
              className="h-14 w-14"
            />
            <span className="text-xs">Entertainment</span>
          </button>

          <button
            onClick={() => handleFooterClick("learn")}
            className={`flex flex-col items-center ${
              selected === "learn" ? "text-pink-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "learn"
                  ? "/anjumenuunselectednew.png"
                  : "/anjumenuselectednew.png"
              }
              alt="Learn"
              className="h-14 w-14"
            />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </div>

      {showLangModal && <LanguageModal close={() => setShowLangModal(false)} />}

      {showProfilePopup && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-3 text-xl text-gray-500" onClick={() => setShowProfilePopup(false)}>×</button>
            <XPProfileForm userId={user.id} onClose={() => setShowProfilePopup(false)} setHasProfile={setHasProfile} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesDetail;