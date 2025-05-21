import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Speaker, Trophy, Music2 } from "lucide-react";

const dummyAudioBooks = [
  {
    title: "The Brave Lion",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    imageUrl: "https://sochuassets.s3.ap-south-1.amazonaws.com/1-a-A.jpg",
  },
  {
    title: "The Curious Rabbit",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    imageUrl: "https://sochuassets.s3.ap-south-1.amazonaws.com/1-a-A.jpg",
  },
];

const dummyBedtimeStories = [
  {
    title: "Starry Night Tales",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    imageUrl: "https://sochuassets.s3.ap-south-1.amazonaws.com/1-a-A.jpg",
  },
  {
    title: "Moonlit Adventures",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    imageUrl: "https://sochuassets.s3.ap-south-1.amazonaws.com/1-a-A.jpg",
  },
];

const Entertainment = () => {
  const [tab, setTab] = useState("audio");
  const [currentAudio, setCurrentAudio] = useState(null);
  const [selected, setSelected] = useState("entertainment");
  const navigate = useNavigate();

  const handlePlay = (url) => {
    setCurrentAudio(url);
    const audio = new Audio(url);
    audio.play();
  };

  // Handle Footer Button Click
  const handleFooterClick = (page) => {
    setSelected(page);
    navigate(`/${page}`);
  };

  return (
    <div className="bg-white p-8 min-h-screen">
      <h2 className="text-4xl font-bold text-black text-center mb-8">
        🎧 Entertainment Hub
      </h2>

      {/* Tabs */}
      <div className="flex justify-center gap-6 mb-6">
        <button
          onClick={() => setTab("audio")}
          className={`py-3 px-6 rounded-full font-bold text-lg transition-all ${
            tab === "audio" ? "bg-yellow-400 text-white" : "bg-white text-black"
          } hover:scale-105`}
        >
          Audio Books
        </button>
        <button
          onClick={() => setTab("bedtime")}
          className={`py-3 px-6 rounded-full font-bold text-lg transition-all ${
            tab === "bedtime"
              ? "bg-purple-400 text-white"
              : "bg-white text-black"
          } hover:scale-105`}
        >
          Bedtime Stories
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {(tab === "audio" ? dummyAudioBooks : dummyBedtimeStories).map(
          (item, index) => (
            <div
              key={index}
              className="bg-white shadow-xl rounded-lg p-6 flex flex-col justify-between items-center hover:scale-105 transition-transform"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-32 h-32 object-cover rounded-lg mb-4"
              />
              <div className="font-semibold text-xl mb-4">{item.title}</div>
              <button
                onClick={() => handlePlay(item.url)}
                className="bg-green-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-green-600 transition-all"
              >
                ▶️ Play
              </button>
            </div>
          )
        )}
      </div>

      {currentAudio && (
        <div className="mt-8 text-center text-white text-lg">
          Now Playing:{" "}
          <span className="font-bold">{currentAudio.split("/").pop()}</span>
        </div>
      )}

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md p-2 pt-6 z-50"> 
        <div className="flex justify-around items-center text-gray-600">
          <button
            onClick={() => handleFooterClick("learn")}
            className={`flex flex-col items-center ${
              selected === "broadcasts" ? "text-blue-600" : "text-gray-600"
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
            <span className="text-xs">Broadcasts</span>
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
            onClick={() => handleFooterClick("broadcasts")}
            className={`flex flex-col items-center ${
              selected === "entertainment" ? "text-green-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "broadcasts"
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
    </div>
  );
};

export default Entertainment;
