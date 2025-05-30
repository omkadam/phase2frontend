import React from "react";
import { useLanguage } from "../context/LanguageContext";

const LanguageModal = ({ close }) => {
  const { setLanguage } = useLanguage();

  const handleSelect = (lang) => {
    setLanguage(lang);
    close();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl p-6 w-80 text-center">
        <h2 className="text-2xl font-bold mb-4">🌐 Choose Language</h2>
        <div className="flex flex-col gap-4">
          <button onClick={() => handleSelect("en")} className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
            English
          </button>
          <button onClick={() => handleSelect("hi")} className="bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600">
            हिंदी
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageModal;
