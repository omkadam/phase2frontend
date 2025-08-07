import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import this

const activities = [
  {
    title: "Sochu Thinking Series",
    subtitle: "Series - 1",
    duration: "12 Books + Activities",
    img: "/thinking.png",
    people: "10 People Enrolled",
    slug: "pause-with-5-breaths",
  },
  {
    title: "Sochu Feeling Series",
    subtitle: "Series - 2",
    duration: "17 Books + Activities",
    img: "/feeling.png",
    people: "0 People Enrolled",
    slug: "finding-hope",
    disabled: true, // 👈 Add this
  },
  {
    title: "Sochu Doing Series",
    subtitle: "Series - 3",
    duration: "22 Books + Activities",
    img: "/doing.png",
    people: "0 People Enrolled",
    slug: "awareness",
    disabled: true, // 👈 Add this
  },
  // {
  //   title: "Finding Happiness at Home",
  //   subtitle: "Course",
  //   duration: "29 Books + Activities",
  //   img: "/doing.png",
  //   people: "29 Peoples Enrolled",
  //   slug: "happiness-at-home"
  // }
];

const SeriesScreen = () => {
  const navigate = useNavigate(); // ✅ Hook to navigate on click
  const [selected, setSelected] = useState("home");
  const handleFooterClick = (page) => {
    setSelected(page);
    navigate(`/${page}`);
  };

  return (
    <div className="min-h-screen bg-white pt-6 px-4 pb-[100px]">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img
          src="/newlogo1.jpeg"
          alt="Sochu Logo"
          className="w-[180px] md:w-[250px]"
        />
      </div>

      {/* Timeline Section */}
      <div className="relative max-w-md mx-auto">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 h-full border-l-2 border-dotted border-gray-300 z-0"></div>

        {activities.map((item, idx) => (
          <div key={idx} className="relative flex items-start gap-3 mb-6 z-10">
            {/* Dot */}
            <div className="w-10 flex justify-center relative">
              <span
                className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${
                  idx === 0 ? "bg-[#e82829]" : "bg-white border border-gray-400"
                } block z-10`}
              ></span>
            </div>

            {/* Clickable Card */}
            <div
              onClick={() => {
                if (!item.disabled) navigate(`/learn/${item.slug}`);
              }}
              className={`flex-1 rounded-xl shadow-sm border p-5 flex items-center justify-between transition-transform ${
                item.disabled
                  ? "bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed"
                  : "bg-white border-gray-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              }`}
            >
              <div className="flex flex-col gap-1 max-w-[60%]">
                <div className="flex items-center gap-1 text-[15px] font-semibold">
                  <span>{item.title}</span>
                </div>
                <p className="text-sm text-gray-500">{item.subtitle}</p>
                <p className="text-sm text-gray-400">{item.duration}</p>
                {item.disabled && (
                  <p className="text-xs mt-1 text-green-500 font-semibold">
                    Coming Soon
                  </p>
                )}
                {item.people && (
                  <p className="text-sm text-indigo-500 mt-1">{item.people}</p>
                )}
              </div>
              <img
                src={item.img}
                alt={item.title}
                className="w-24 h-24 object-cover rounded-md"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md p-2 pt-3 z-50">
        <div className="flex justify-around items-center text-gray-600 pb-3">
          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3"); // Make sure this file exists in public/sounds
              audio.play();
              handleFooterClick("learn");
            }}
            className={`flex flex-col items-center ${
              selected === "home" ? "text-blue-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "learn"
                  ? "/sochumenuselectednew.png"
                  : "/sochumenuunselectednew.png"
              }
              alt="Broadcast"
              className="h-14 w-14"
            />
            <span className="text-xs">Learn</span>
          </button>

          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3"); // Make sure the sound file exists in public/sounds/
              audio.play();
              handleFooterClick("leaderboard");
            }}
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
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3"); // Make sure this file exists in public/sounds
              audio.play();
              handleFooterClick("episodes");
            }}
            className={`flex flex-col items-center ${
              selected === "entertainment" ? "text-green-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "episodes"
                  ? "/rajumenuselectednew.png"
                  : "/rajumenuunselectednew.png"
              }
              alt="Entertainment"
              className="h-14 w-14"
            />
            <span className="text-xs">Entertainment</span>
          </button>

          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3"); // Make sure this file is in your public/sounds folder
              audio.play();
              handleFooterClick("setting");
            }}
            className={`flex flex-col items-center ${
              selected === "learn" ? "text-pink-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "setting"
                  ? "/anjumenuunselectednew.png"
                  : "/anjumenuselectednew.png"
              }
              alt="Learn"
              className="h-14 w-14"
            />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeriesScreen;
