import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const Review = ({ question, onNext }) => {
  const { language } = useLanguage();
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  // Static text - no need to store in database
  const staticTexts = {
    completionMessage: {
      en: "Woohoo! You've completed this whole book!",
      hi: "वाह! आपने यह पूरी किताब पूरी कर ली है!"
    },
    ratingQuestion: {
      en: "How would you rate this story?",
      hi: "आप इस कहानी को कैसे रेट करेंगे?"
    },
    feedbackPlaceholder: {
      en: "Have something more to say? Go ahead, write it here!",
      hi: "कुछ और कहना है? यहाँ लिखें!"
    },
    submitButton: {
      en: "SUBMIT",
      hi: "जमा करें"
    }
  };

  // Only get the image from database - question.image field
  const bookImage = question.image || "https://d16ho1g3lqitul.cloudfront.net/sochu-think-outside-the-box.jpg";

  const handleStarClick = (rating) => {
    setSelectedRating(rating);
    
    // Play click sound if available
    try {
      const audio = new Audio("/sounds/click.mp3");
      audio.play().catch(err => console.warn("Click sound failed:", err));
    } catch (err) {
      console.warn("Click sound not available:", err);
    }
  };

  const handleSubmit = async () => {
    // You can add API call here to save the review data if needed
    try {
      console.log("Review submitted:", {
        image: bookImage,
        rating: selectedRating,
        feedback,
        language,
        timestamp: new Date().toISOString()
      });
      
      // Play submit sound
      try {
        const audio = new Audio("/sounds/success.mp3");
        audio.play().catch(err => console.warn("Success sound failed:", err));
      } catch (err) {
        console.warn("Success sound not available:", err);
      }
      
      // Move to next question/lesson
      onNext();
    } catch (error) {
      console.error("Error submitting review:", error);
      // Still proceed to next even if review save fails
      onNext();
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="w-full max-w-xs sm:max-w-sm flex flex-col items-center justify-center h-full">
        
        {/* Book Cover - Fully responsive */}
        <div className="flex-shrink-0 mb-3 sm:mb-4">
          <img
            src={bookImage}
            alt="Book Cover"
            className="w-32 h-40 sm:w-40 sm:h-52 md:w-48 md:h-64 mx-auto rounded-xl shadow-xl object-cover"
          />
        </div>

        {/* Static Completion Message - Responsive text */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-2 sm:mb-4 leading-tight px-2">
            {staticTexts.completionMessage[language]}
          </h1>

          {/* Static Rating Question - Responsive text */}
          <p className="text-base sm:text-lg md:text-xl font-semibold text-black mb-4 sm:mb-6 px-2">
            {staticTexts.ratingQuestion[language]}
          </p>
        </div>

        {/* Star Rating - Responsive size and spacing */}
        <div className="flex justify-center gap-1 sm:gap-2 md:gap-3 mb-4 sm:mb-6 flex-shrink-0">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleStarClick(star)}
              className="transform transition-transform hover:scale-110 focus:outline-none"
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <svg
                className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 ${
                  star <= selectedRating
                    ? "text-orange-400 fill-current"
                    : "text-gray-300 fill-current"
                }`}
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </div>

        {/* Feedback Text Area - Responsive and flexible */}
        <div className="w-full mb-4 sm:mb-6 flex-1 min-h-0 max-h-32">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={staticTexts.feedbackPlaceholder[language]}
            className="w-full h-full min-h-[80px] max-h-[120px] p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-xs sm:text-sm placeholder-gray-400 resize-none focus:outline-none focus:border-gray-300 focus:bg-white"
            style={{
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Static Submit Button - Responsive and fixed at bottom */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 sm:py-4 bg-green-500 text-white font-bold text-base sm:text-lg md:text-xl rounded-full shadow-lg hover:bg-green-600 transition-colors focus:outline-none flex-shrink-0 border-b-4 border-green-700"
          style={{
            backgroundColor: '#22C55E'
          }}
        >
          {staticTexts.submitButton[language]}
        </button>
      </div>
    </div>
  );
};

export default Review;