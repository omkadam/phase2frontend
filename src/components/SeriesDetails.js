import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const SeriesDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [unlockedLessons, setUnlockedLessons] = useState([]);
  const [xp, setXp] = useState(0);
  const [hearts, setHearts] = useState(5);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    // Fetch series details
    fetch(`http://localhost:3001/api/series/${slug}`)
      .then((res) => res.json())
      .then((data) => setSeries(data));

    // Fetch user progress (unlockedLessons, xp, hearts)
    fetch(`http://localhost:3001/api/series/${slug}/progress/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setUnlockedLessons(data.unlockedLessons ?? [0]);
        setXp(data.xp ?? 0);
        setHearts(data.hearts ?? 5);
      });
  }, [slug, user]);

  if (!series) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white pt-4 pb-24 px-4 overflow-x-hidden">
      {/* Top Bar: Back | Lang | XP/Hearts */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => window.history.back()} className="text-xl"> ← </button>
        <img src="https://d16ho1g3lqitul.cloudfront.net/india.svg" className="w-6 h-6" alt="lang" />
        <div className="flex items-center gap-3 text-sm font-semibold">
          <span className="text-orange-500">⚡ {xp}</span>
          <span className="text-red-500">❤️ {hearts}</span>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-[#009aef] text-white rounded-xl px-5 py-4 flex justify-between items-center shadow-md mb-10">
        <div>
          <h1 className="text-lg font-bold">{series.title}</h1>
          <p className="text-sm">{series.subtitle}</p>
        </div>
        <img src={series.image} className="w-12 h-12" alt="Book Icon" />
      </div>

      {/* Lesson Buttons */}
      <div className="relative flex flex-col items-center">
        {[...Array(series.steps)].map((_, index) => {
          const rightShift = Math.sin(index * Math.PI / 3) * 50;
          const isUnlocked = unlockedLessons.includes(index);

          return (
            <div key={index} className="relative flex justify-center w-full" style={{ marginTop: index === 0 ? 0 : 24 }}>
              <button
                disabled={!isUnlocked}
                onClick={() => navigate(`/lesson/${slug}/lesson-${index + 1}`)}
                className={`w-[70px] h-[70px] rounded-full border-4 shadow-md flex items-center justify-center text-white font-bold text-xl transition-all duration-300 ${
                  isUnlocked
                    ? "bg-yellow-400 border-yellow-500"
                    : "bg-gray-300 border-gray-400 cursor-not-allowed"
                }`}
                style={{ transform: `translateX(${rightShift}px)` }}
              >
                ✓
              </button>

              {(index + 1) % 3 === 0 && (
                <img
                  src="https://d16ho1g3lqitul.cloudfront.net/sochuloop.gif"
                  className={`absolute w-[100px] top-[-50px] ${
                    index % 2 === 0 ? "left-1 sm:left-[-80px]" : "right-1 sm:right-[-80px]"
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
};

export default SeriesDetail;
