import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const SeriesDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [series, setSeries] = useState(null);
  const [unlockedLessons, setUnlockedLessons] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [xp, setXp] = useState(0);
  const [hearts, setHearts] = useState(5);

  useEffect(() => {
    if (!user) return;

    fetch(`http://localhost:3001/api/series/${slug}`)
      .then(res => res.json())
      .then(data => setSeries(data));

    fetch(`http://localhost:3001/api/series/${slug}/progress/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setUnlockedLessons(data.unlockedLessons ?? [0]);
        setIsSubscribed(data.isSubscribed ?? false);
        setXp(data.xp ?? 0);
        setHearts(data.hearts ?? 5);
      });
  }, [slug, user]);

  if (!series) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white pt-24 pb-32 px-4 overflow-x-hidden relative">
      
      {/* 🧩 Fixed Top Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/learn')} className="text-2xl">
            ←
          </button>
          <img
            src="https://d16ho1g3lqitul.cloudfront.net/india.svg"
            alt="lang"
            className="w-7 h-7"
          />
        </div>
        <div className="flex items-center gap-3 text-sm font-bold">
          <span className="text-orange-500">⚡ {xp}</span>
          <span className="text-red-500">❤️ {hearts}</span>
        </div>
      </div>

      {/* Units Loop */}
      {series.units.map((unit, unitIndex) => {
        const canAccessUnit = isSubscribed || unitIndex === 0;

        return (
          <div key={unitIndex} className="mb-12">
            {/* Unit Banner */}
            <div className="bg-[#009aef] text-white rounded-xl px-6 py-5 flex justify-between items-center shadow-lg mb-6">
              <div>
                <h2 className="text-xl font-bold">{unit.title}</h2>
                <p className="text-sm opacity-90">{unit.subtitle}</p>
              </div>
              <img
                src={unit.image}
                alt="Unit"
                className="w-14 h-14 rounded-lg object-cover"
              />
            </div>

            {/* Lessons inside Unit */}
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
                  <div
                    key={lessonIndex}
                    className="relative flex justify-center w-full"
                    style={{ marginTop: lessonIndex === 0 ? 0 : 24 }}
                  >
                    <button
                      disabled={!canAccessUnit || !isUnlocked}
                      onClick={() =>
                        navigate(`/lesson/${slug}/lesson-${unitIndex + 1}-${lessonIndex + 1}`)
                      }
                      className={`w-[70px] h-[70px] rounded-full flex items-center justify-center text-white font-bold text-xl border-4 transition-all shadow-md ${
                        canAccessUnit && isUnlocked
                          ? "bg-yellow-400 border-yellow-500 hover:scale-110"
                          : "bg-gray-300 border-gray-400 cursor-not-allowed"
                      }`}
                      style={{ transform: `translateX(${rightShift}px)` }}
                    >
                      {lessonIndex + 1}
                    </button>

                    {(lessonIndex + 1) % 3 === 0 && (
                      <img
                        src="https://d16ho1g3lqitul.cloudfront.net/sochuloop.gif"
                        className={`absolute w-[100px] top-[-50px] ${
                          lessonIndex % 2 === 0
                            ? "left-1 sm:left-[-80px]"
                            : "right-1 sm:right-[-80px]"
                        }`}
                        alt="Sochu"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* 🌟 Sexy Subscription Card */}
      {!isSubscribed && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center items-center px-6">
          <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white p-6 rounded-2xl shadow-2xl w-full max-w-md text-center animate-pulse">
            <div className="text-2xl font-bold mb-2">🚀 Unlock All Units!</div>
            <div className="text-sm opacity-90 mb-4">Subscribe now and continue your journey!</div>
            <button className="mt-2 bg-white text-pink-600 font-bold py-2 px-6 rounded-full shadow-md hover:bg-pink-100 transition">
              Subscribe 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesDetail;
