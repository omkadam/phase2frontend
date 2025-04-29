import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useLanguage } from "../context/LanguageContext";

const BookReader = ({ question, onNext }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const touchStartX = useRef(null);
  const navigate = useNavigate();
  const { seriesSlug, lessonId } = useParams();
  const { user } = useUser();
  const { language } = useLanguage(); // ✅ language context

  // 👉 Pages language-specific
  const pages = question?.pages?.[language] || [];

  const handleNextPage = () => {
    if (currentPage + 1 < pages.length) {
      setCurrentPage((prev) => prev + 1);
    } else {
      completeBook();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const completeBook = async () => {
    if (user) {
      await fetch(`http://localhost:3001/api/series/${seriesSlug}/progress/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          xpChange: 10,
          heartChange: 0,
        }),
      });

      if (onNext) onNext();
    }
  };

  if (!pages.length) {
    return <div className="p-4 text-center text-red-500">No images found!</div>;
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX.current;

    if (diff > 50) {
      handlePrevPage();
    } else if (diff < -50) {
      handleNextPage();
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-white p-6 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image Display */}
      <div className="relative max-w-xs md:max-w-md lg:max-w-lg w-full shadow-lg rounded-2xl overflow-hidden mb-8">
        <img
          src={pages[currentPage]}
          alt={`Page ${currentPage + 1}`}
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-6">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          ⬅️ Previous
        </button>

        <button
          onClick={handleNextPage}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          {currentPage + 1 === pages.length ? "Finish 📚" : "Next ➡️"}
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Page {currentPage + 1} / {pages.length}
      </div>
    </div>
  );
};

export default BookReader;
