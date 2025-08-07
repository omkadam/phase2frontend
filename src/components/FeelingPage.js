import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const feelingsData = [
  { label: "HAPPY", image: "/Asset91.svg" },
  { label: "SAD", image: "/anjuf.svg" },
  { label: "ANGRY", image: "/manjuf.svg" },
  { label: "AFRAID", image: "/sherf.svg" },
  { label: "DISGUSTED", image: "/robertf.svg" },
  { label: "SURPRISED", image: "/rajuf.svg" },
  { label: "EXCITED", image: "/rehmanf.svg" },
  { label: "CALM", image: "/julief.svg" },
];

const FeelingsJournal = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [selectedFeeling, setSelectedFeeling] = useState("");
  const [customText, setCustomText] = useState("");

  const handleFeelingSelect = (label) => {
    setSelectedFeeling(label);
    
    // Play click sound
    try {
      const audio = new Audio("/sounds/click.mp3");
      audio.play().catch(err => console.warn("Click sound failed:", err));
    } catch (err) {
      console.warn("Click sound not available:", err);
    }
  };

  const handleSubmit = async () => {
    const feelingToSubmit = selectedFeeling || customText;
    
    if (!feelingToSubmit) {
      alert("Please select a feeling or write something!");
      return;
    }

    try {
      await fetch(`https://sochu.online/api/feeling/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          feeling: feelingToSubmit,
          customText: customText || null 
        }),
      });
      
      // Play success sound
      try {
        const audio = new Audio("/sounds/success.mp3");
        audio.play().catch(err => console.warn("Success sound failed:", err));
      } catch (err) {
        console.warn("Success sound not available:", err);
      }
      
      navigate("/learn");
    } catch (error) {
      console.error("Error submitting feeling:", error);
      navigate("/learn"); // Still navigate even if API fails
    }
  };

  return (
    // added padding of 7px on X-axis
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-3 sm:p-4 overflow-hidden px-7"> 
      <div className="w-full max-w-sm flex flex-col items-center justify-center h-full">
        
        {/* Character Icon - Smaller and responsive */}
        <div className="flex-shrink-0 mb-3 sm:mb-4 py-6">
          <div className="w-30 h-16 sm:w-20 sm:h-20   flex items-center justify-center ">
            <img 
              src="/Sochu_logo_Feelings.svg" 
              alt="Character" 
              className="w-30 h-16 sm:w-16 sm:h-16"
            />
          </div>
        </div>

        {/* Title - Compact */}
        <h1 className="text-xl sm:text-2xl font-bold text-black mb-2 sm:mb-3 text-center">
          FEELINGS JOURNAL
        </h1>

        {/* Subtitle - Compact */}
        <p className="text-xs sm:text-sm text-gray-600 text-center mb-1 sm:mb-2 px-8 leading-tight">
          Journaling our feelings everyday helps us keep in touch with ourselves!
        </p>

        {/* Question - Compact */}
        <p className="text-sm sm:text-base font-semibold text-black text-center mb-4 sm:mb-5">
          How are you feeling today?
        </p>

        {/* Feelings Grid - Bigger cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4 w-full max-w-sm flex-shrink-0 ">
          {feelingsData.map((feeling, index) => (
            <button
              key={feeling.label}
              onClick={() => handleFeelingSelect(feeling.label)}
              className={`
                bg-white border-2 rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center
                transition-all duration-200 shadow-sm hover:shadow-md min-h-[90px] sm:min-h-[100px]
                ${selectedFeeling === feeling.label 
                  ? 'border-blue-500 bg-blue-50 scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="w-16 h-16 sm:w-14 sm:h-14 mb-2 flex items-center justify-center">
                <img 
                  src={feeling.image} 
                  alt={feeling.label}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight">
                {feeling.label}
              </span>
            </button>
          ))}
        </div>

        {/* Custom Text Input - Flexible height */}
        <div className="w-full mb-3 sm:mb-4 flex-1 min-h-0 ">
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="You can elaborate on it here or even mention a different feeling here..."
            className="w-full h-full min-h-[60px] max-h-[80px] p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm text-gray-600 placeholder-gray-400 resize-none focus:outline-none focus:border-gray-300 focus:bg-white"
          />
        </div>

        {/* Submit Button - Fixed at bottom */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 sm:py-4 bg-green-500 text-white font-bold text-base sm:text-lg rounded-full shadow-lg hover:bg-green-600 transition-colors focus:outline-none flex-shrink-0 "
          style={{ backgroundColor: '#22C55E' }}
        >
          SUBMIT
        </button>
      </div>
    </div>
  );
};

export default FeelingsJournal;