// Entertainment.js
import React, { useState } from "react";

const dummyAudioBooks = [
  {
    title: "The Brave Lion",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    title: "The Curious Rabbit",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  }
];

const dummyBedtimeStories = [
  {
    title: "Starry Night Tales",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    title: "Moonlit Adventures",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  }
];

const Entertainment = () => {
  const [tab, setTab] = useState("audio");
  const [currentAudio, setCurrentAudio] = useState(null);

  const handlePlay = (url) => {
    setCurrentAudio(url);
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">🎧 Entertainment</h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setTab("audio")}
          className={`py-2 px-4 rounded-full font-bold ${
            tab === "audio" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Audio Books
        </button>
        <button
          onClick={() => setTab("bedtime")}
          className={`py-2 px-4 rounded-full font-bold ${
            tab === "bedtime" ? "bg-purple-500 text-white" : "bg-gray-200"
          }`}
        >
          Bedtime Stories
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {(tab === "audio" ? dummyAudioBooks : dummyBedtimeStories).map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-white shadow p-3 rounded"
          >
            <div className="font-medium">{item.title}</div>
            <button
              onClick={() => handlePlay(item.url)}
              className="bg-green-500 text-white px-3 py-1 rounded shadow"
            >
              ▶️ Play
            </button>
          </div>
        ))}
      </div>

      {/* Optional: Show current playing audio name */}
      {currentAudio && (
        <div className="mt-4 text-sm text-gray-600">
          Now Playing: {currentAudio.split("/").pop()}
        </div>
      )}
    </div>
  );
};

export default Entertainment;