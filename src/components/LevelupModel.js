import React from "react";

const LevelUpModal = ({ level, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md w-full">
        <h2 className="text-3xl font-bold mb-4 text-green-600">🎉 Level Up!</h2>
        <p className="text-lg font-semibold mb-6">You reached <span className="text-blue-500">Level {level}</span>!</p>
        <button
          onClick={onClose}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-xl"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
};

export default LevelUpModal;
