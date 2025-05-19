import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import this

const activities = [
  {
    title: "Sochu Thinking Series",
    subtitle: "Series - 1",
    duration: "12 Books + Activities",
    img: "/thinking.png",
    people: "10 People Enrolled",
    slug: "pause-with-5-breaths"
  },
  {
    title: "Sochu Feeling Series",
    subtitle: "Series - 2",
    duration: "17 Books + Activities",
    img: "/feeling.png",
    people: "28 People Enrolled",
    slug: "finding-hope"
  },
  {
    title: "Sochu Doing Series",
    subtitle: "Series - 3",
    duration: "22 Books + Activities",
    img: "/doing.png",
    people: "51 People Enrolled",
    slug: "awareness"
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
                  idx === 0
                    ? "bg-[#e82829]"
                    : "bg-white border border-gray-400"
                } block z-10`}
              ></span>
            </div>

            {/* Clickable Card */}
            <div
              onClick={() => navigate(`/learn/${item.slug}`)} // ✅ Navigate to detail
              className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex flex-col gap-1 max-w-[60%]">
                <div className="flex items-center gap-1 text-[15px] font-semibold">
                  <span>{item.title}</span>
                </div>
                <p className="text-sm text-gray-500">{item.subtitle}</p>
                <p className="text-sm text-gray-400">{item.duration}</p>
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
      <div className="fixed bottom-0 left-0 right-0 h-[70px] bg-white border-t border-gray-200 flex justify-around items-center px-6 z-50">
        <img
          src="https://d16ho1g3lqitul.cloudfront.net/homev2.svg"
          className="w-7 h-7"
          alt="Home"
        />
        <img
          src="https://d16ho1g3lqitul.cloudfront.net/leaderboardv2.svg"
          className="w-7 h-7"
          alt="Leaderboard"
        />
        <img
          src="https://d16ho1g3lqitul.cloudfront.net/questsv2.svg"
          className="w-7 h-7"
          alt="Quests"
        />
        <img
          src="https://d16ho1g3lqitul.cloudfront.net/shopv2.svg"
          className="w-7 h-7"
          alt="Shop"
        />
      </div>
    </div>
  );
};

export default SeriesScreen;
