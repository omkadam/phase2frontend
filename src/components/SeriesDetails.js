// ✅ SeriesDetail.js
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
  const [showBroadcasts, setShowBroadcasts] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showEntertainment, setShowEntertainment] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

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
                let globalIndex = 0;
                for (let i = 0; i < unitIndex; i++) {
                  globalIndex += series.units[i].lessons.length;
                }
                globalIndex += lessonIndex;
                const isUnlocked = unlockedLessons.includes(globalIndex);
                return (
                  <div key={lessonIndex} className="relative flex justify-center w-full" style={{ marginTop: lessonIndex === 0 ? 0 : 24 }}>
                    <button
                      disabled={!canAccessUnit || !isUnlocked}
                      onClick={() => navigate(`/lesson/${slug}/lesson-${unitIndex + 1}-${lessonIndex + 1}`)}
                      className={`w-[70px] h-[70px] rounded-full flex items-center justify-center text-white font-bold text-xl border-4 transition-all shadow-md ${canAccessUnit && isUnlocked ? "bg-yellow-400 border-yellow-500 hover:scale-110" : "bg-gray-300 border-gray-400 cursor-not-allowed"}`}
                      style={{ transform: `translateX(${rightShift}px)` }}
                    >
                      {lessonIndex + 1}
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

      <div className="fixed bottom-2 left-4 right-4 z-50 flex justify-between">
        <button onClick={() => setShowBroadcasts(true)} className="bg-[#FFDEAD] p-3 rounded-full shadow-lg hover:bg-blue-600 text-white">
          <Speaker size={24} />
        </button>
        <button onClick={() => setShowLeaderboard(true)} className="bg-yellow-500 p-3 rounded-full shadow-lg hover:bg-yellow-600 text-white">
          <Trophy size={24} />
        </button>
        <button onClick={() => setShowEntertainment(true)} className="bg-green-500 p-3 rounded-full shadow-lg hover:bg-green-600 text-white">
          <Music2 size={24} />
        </button>
      </div>

      {showLangModal && <LanguageModal close={() => setShowLangModal(false)} />}

      {showBroadcasts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
            <button className="absolute top-2 right-3 text-gray-600 text-xl" onClick={() => setShowBroadcasts(false)}>×</button>
            <BroadcastList />
          </div>
        </div>
      )}

      {showLeaderboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
            <button className="absolute top-2 right-3 text-gray-600 text-xl" onClick={() => setShowLeaderboard(false)}>×</button>
            <Leaderboard />
          </div>
        </div>
      )}

      {showEntertainment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
            <button className="absolute top-2 right-3 text-gray-600 text-xl" onClick={() => setShowEntertainment(false)}>×</button>
            <Entertainment />
          </div>
        </div>
      )}

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
