import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { X } from "lucide-react";

const BookReader = ({ pages = [], onNext }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const touchStartX = useRef(null);
  const navigate = useNavigate();
  const { seriesSlug } = useParams();
  const { user } = useUser();

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

  const handleClose = () => {
    navigate(-1); // Navigate to previous page
  };

  if (!Array.isArray(pages) || pages.length === 0) {
    return <div className="text-center text-red-500">No images found!</div>;
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

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    
    if (clickX < width / 2) {
      handlePrevPage();
    } else {
      handleNextPage();
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      {/* Cross Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 left-4 z-50 w-12 h-12 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors shadow-lg"
      >
        <X size={24} className="text-black" />
      </button>

      {/* Progress Bar */}
      <div className="absolute top-14 left-4 right-4 h-3 bg-white rounded-full overflow-hidden z-40">
        <div
          className="h-full bg-green-500 transition-all rounded-full"
          style={{
            width: `${pages.length > 0 ? ((currentPage + 1) / pages.length) * 100 : 0}%`,
          }}
        />
      </div>

      {/* Full Screen Image */}
      <div
        className="w-full h-full flex items-center justify-center cursor-pointer select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <img
          src={pages[currentPage]}
          alt={`Page ${currentPage + 1}`}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
    </div>
  );
};

export default BookReader;