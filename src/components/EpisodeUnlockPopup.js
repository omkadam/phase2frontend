import React from "react";
import { X, Play, Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const EpisodeUnlockPopup = ({ episodeNumber, onClose, onGoToEpisodes }) => {
  const { language } = useLanguage();

  const texts = {
    en: {
      congratulations: "Congratulations! 🎉",
      episodeUnlocked: `Episode ${episodeNumber} Unlocked!`,
      description: "You've completed a unit and unlocked a new episode in the Entertainment section.",
      watchNow: "Watch Now",
      later: "Later",
      goToEpisodes: "Go to Episodes"
    },
    hi: {
      congratulations: "बधाई हो! 🎉",
      episodeUnlocked: `एपिसोड ${episodeNumber} अनलॉक हो गया!`,
      description: "आपने एक यूनिट पूरा कर लिया है और मनोरंजन अनुभाग में एक नया एपिसोड अनलॉक किया है।",
      watchNow: "अभी देखें",
      later: "बाद में",
      goToEpisodes: "एपिसोड देखें"
    }
  };

  const currentTexts = texts[language];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md relative animate-bounce-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Sparkles Animation */}
          <div className="relative mb-4">
            <div className="text-6xl mb-2">🎭</div>
            <div className="absolute -top-2 -right-2 animate-pulse">
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="absolute -bottom-2 -left-2 animate-pulse delay-300">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {currentTexts.congratulations}
          </h2>

          {/* Episode Number */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full inline-block mb-4">
            <span className="font-bold text-lg">{currentTexts.episodeUnlocked}</span>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            {currentTexts.description}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              {currentTexts.later}
            </button>
            <button
              onClick={onGoToEpisodes}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
            >
              <Play size={18} />
              {currentTexts.watchNow}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeUnlockPopup;