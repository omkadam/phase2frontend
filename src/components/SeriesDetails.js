import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useLanguage } from "../context/LanguageContext";
import LanguageModal from "./LanguageModal";
import BroadcastList from "./BroadcastList";
import XPProfileForm from "./XPProfileForm";
import Leaderboard from "./Leaderboard";
import Entertainment from "./Entertainment";
import { Speaker, Trophy, Music2, X, Notebook } from "lucide-react";
import { CircleArrowLeft } from "lucide-react";
import Rive from "@rive-app/react-canvas";

const SeriesDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { language } = useLanguage();
  const [series, setSeries] = useState(null);
  const [unlockedLessons, setUnlockedLessons] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [xp, setXp] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [selected, setSelected] = useState("broadcasts");
  const [popupData, setPopupData] = useState(null);
  const [profilePopupShown, setProfilePopupShown] = useState(false);
  const [completedUnits, setCompletedUnits] = useState([]);
  const [hasScrolledToPosition, setHasScrolledToPosition] = useState(false);

  // Refs for scroll targets
  const unitRefs = useRef({});
  const lessonRefs = useRef({});
  const scrollTimeoutRef = useRef(null);

  const handleFooterClick = (page) => {
    setSelected(page);
    switch (page) {
      case "broadcasts":
        navigate("/learn");
        break;
      case "leaderboard":
        navigate("/leaderboard");
        break;
      case "entertainment":
        navigate("/episodes");
        break;
      case "learn":
        navigate("/setting");
        break;
      case "bedtime":
        navigate("/bedtime-stories")
      default:
        break;
    }
  };

  // FIXED: Find the actual current lesson (next lesson to complete)
  const getCurrentLessonPosition = useCallback(() => {
    if (!series || !unlockedLessons.length) return null;

    console.log('Unlocked lessons:', unlockedLessons);
    
    // Calculate total lessons to understand the progress
    let totalLessons = 0;
    series.units.forEach(unit => {
      totalLessons += unit.lessons.length;
    });
    
    // Sort unlocked lessons to ensure proper order
    const sortedUnlockedLessons = [...unlockedLessons].sort((a, b) => a - b);
    console.log('Sorted unlocked lessons:', sortedUnlockedLessons);
    
    // Find the first "gap" in unlocked lessons - that's where the user should be
    let targetGlobalIndex = 0;
    
    // If lesson 0 is not unlocked, start there
    if (!sortedUnlockedLessons.includes(0)) {
      targetGlobalIndex = 0;
    } else {
      // Find the first missing lesson in the sequence
      for (let i = 0; i < totalLessons; i++) {
        if (!sortedUnlockedLessons.includes(i)) {
          targetGlobalIndex = i;
          break;
        }
      }
      
      // If all lessons are unlocked, go to the last unlocked lesson
      if (targetGlobalIndex === 0 && sortedUnlockedLessons.length > 1) {
        targetGlobalIndex = Math.max(...sortedUnlockedLessons);
      }
    }
    
    console.log('Target global index for scroll:', targetGlobalIndex);
    
    // Convert global index to unit and lesson indices
    let currentGlobalIndex = 0;
    for (let unitIndex = 0; unitIndex < series.units.length; unitIndex++) {
      const unit = series.units[unitIndex];
      
      for (let lessonIndex = 0; lessonIndex < unit.lessons.length; lessonIndex++) {
        if (currentGlobalIndex === targetGlobalIndex) {
          console.log(`Found target position: Unit ${unitIndex + 1}, Lesson ${lessonIndex + 1}`);
          return {
            unitIndex,
            lessonIndex,
            globalIndex: currentGlobalIndex,
            isCurrentLesson: true
          };
        }
        currentGlobalIndex++;
      }
    }

    // Fallback to first lesson if something went wrong
    console.log('Falling back to first lesson');
    return {
      unitIndex: 0,
      lessonIndex: 0,
      globalIndex: 0,
      isCurrentLesson: false
    };
  }, [series, unlockedLessons]);

  // IMPROVED: More robust scroll function with better error handling
  const scrollToCurrentPosition = useCallback(() => {
    if (!series || !unlockedLessons.length || hasScrolledToPosition) {
      return;
    }

    const currentPosition = getCurrentLessonPosition();
    if (!currentPosition) {
      return;
    }

    const { unitIndex, lessonIndex } = currentPosition;
    const lessonKey = `${unitIndex}-${lessonIndex}`;

    console.log(`Attempting to scroll to lesson: Unit ${unitIndex + 1}, Lesson ${lessonIndex + 1}`);

    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Function to attempt scroll with retries
    const attemptScroll = (retryCount = 0) => {
      const maxRetries = 5;
      const lessonElement = lessonRefs.current[lessonKey];
      
      if (lessonElement) {
        try {
          lessonElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
          console.log(`Successfully scrolled to lesson ${unitIndex + 1}-${lessonIndex + 1}`);
          setHasScrolledToPosition(true);
          return;
        } catch (error) {
          console.error('Error during scroll:', error);
        }
      }

      // Retry if element not found and we haven't exceeded max retries
      if (retryCount < maxRetries) {
        console.log(`Lesson element not found, retrying... (${retryCount + 1}/${maxRetries})`);
        scrollTimeoutRef.current = setTimeout(() => {
          attemptScroll(retryCount + 1);
        }, 300);
        return;
      }

      // Fallback to scrolling to unit if lesson scroll fails
      console.log('Falling back to unit scroll');
      const unitElement = unitRefs.current[unitIndex];
      if (unitElement) {
        try {
          unitElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
          console.log(`Fallback: Scrolled to unit ${unitIndex + 1}`);
          setHasScrolledToPosition(true);
        } catch (error) {
          console.error('Error during unit scroll:', error);
        }
      } else {
        console.log('Unit element also not found');
      }
    };

    // Start the scroll attempt with a small delay to ensure rendering
    scrollTimeoutRef.current = setTimeout(() => {
      attemptScroll();
    }, 100);
  }, [series, unlockedLessons, hasScrolledToPosition, getCurrentLessonPosition]);

  // FIXED: Active lesson is the next lesson to complete, not the highest unlocked
  const isActiveLesson = useCallback((unitIndex, lessonIndex) => {
    if (!series || !unlockedLessons.length) return false;
    
    let globalIndex = 0;
    for (let i = 0; i < unitIndex; i++) {
      globalIndex += series.units[i].lessons.length;
    }
    globalIndex += lessonIndex;

    // Sort unlocked lessons to ensure proper order
    const sortedUnlockedLessons = [...unlockedLessons].sort((a, b) => a - b);
    
    // Calculate total lessons
    let totalLessons = 0;
    series.units.forEach(unit => {
      totalLessons += unit.lessons.length;
    });
    
    // Find the target lesson (first gap in sequence or next after completed)
    let targetGlobalIndex = 0;
    
    if (!sortedUnlockedLessons.includes(0)) {
      targetGlobalIndex = 0;
    } else {
      // Find the first missing lesson in the sequence
      for (let i = 0; i < totalLessons; i++) {
        if (!sortedUnlockedLessons.includes(i)) {
          targetGlobalIndex = i;
          break;
        }
      }
      
      // If all lessons are unlocked, target the last one
      if (targetGlobalIndex === 0 && sortedUnlockedLessons.length > 1) {
        targetGlobalIndex = Math.max(...sortedUnlockedLessons);
      }
    }
    
    return globalIndex === targetGlobalIndex;
  }, [series, unlockedLessons]);

  // Check if a unit is completed
  const isUnitCompleted = (unitIndex) => {
    if (!series || !series.units || !series.units[unitIndex]) return false;
    
    const unit = series.units[unitIndex];
    const totalLessonsInUnit = unit.lessons.length;
    
    // Calculate global indices for this unit
    let startGlobalIndex = 0;
    for (let i = 0; i < unitIndex; i++) {
      startGlobalIndex += series.units[i].lessons.length;
    }
    
    // Check if all lessons in this unit are completed
    for (let lessonIndex = 0; lessonIndex < totalLessonsInUnit; lessonIndex++) {
      const globalIndex = startGlobalIndex + lessonIndex;
      if (!unlockedLessons.includes(globalIndex + 1)) { // +1 because next lesson should be unlocked
        return false;
      }
    }
    
    return true;
  };

  // SIMPLIFIED: Just unlock episodes silently without popup
  useEffect(() => {
    if (series && unlockedLessons.length > 0) {
      const newlyCompletedUnits = [];
      
      series.units.forEach((unit, unitIndex) => {
        const unitNumber = unitIndex + 1;
        if (isUnitCompleted(unitIndex) && !completedUnits.includes(unitNumber)) {
          newlyCompletedUnits.push(unitNumber);
        }
      });
      
      if (newlyCompletedUnits.length > 0) {
        // Update completed units state
        setCompletedUnits(prev => [...prev, ...newlyCompletedUnits]);
        
        // Silently unlock episodes without popup
        const latestCompletedUnit = Math.max(...newlyCompletedUnits);
        unlockEpisodeSilently(latestCompletedUnit);
      }
    }
  }, [unlockedLessons, series, completedUnits]);

  // IMPROVED: Auto-scroll effect with better timing
  useEffect(() => {
    // Only scroll if we have all the data and haven't scrolled yet
    if (series && unlockedLessons.length > 0 && !hasScrolledToPosition) {
      // Use a longer delay to ensure all components are fully rendered
      const scrollTimer = setTimeout(() => {
        scrollToCurrentPosition();
      }, 1000);

      return () => clearTimeout(scrollTimer);
    }
  }, [series, unlockedLessons, hasScrolledToPosition, scrollToCurrentPosition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // SIMPLIFIED: Unlock episode without showing popup
  const unlockEpisodeSilently = async (unitNumber) => {
    try {
      // API call to unlock episode (silent)
      await fetch(`http://localhost:3001/api/series/episodes/${user.id}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodeNumber: unitNumber })
      });

      console.log(`Episode ${unitNumber} unlocked silently`);
    } catch (error) {
      console.error("Error unlocking episode:", error);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    // Fetch series data
    fetch(`http://localhost:3001/api/series/${slug}`)
      .then((res) => res.json())
      .then((data) => setSeries(data));
    
    // Fetch user progress
    fetch(`http://localhost:3001/api/series/${slug}/progress/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setUnlockedLessons(data.unlockedLessons ?? [0]);
        setIsSubscribed(data.isSubscribed ?? false);
        setXp(data.xp ?? 0);
        setHearts(data.hearts ?? 5);
      });
    
    // Fetch user profile
    fetch(`http://localhost:3001/api/user-profile/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setHasProfile(true);
        setProfilePopupShown(data.profilePopupShown ?? false);
      })
      .catch(() => {
        setHasProfile(false);
        setProfilePopupShown(false);
      });
  }, [slug, user]);

  useEffect(() => {
    if (xp >= 100 && !showProfilePopup && !hasProfile && !profilePopupShown) {
      setShowProfilePopup(true);
      setProfilePopupShown(true);
      fetch(`http://localhost:3001/api/user-profile/${user.id}/popup-shown`, {
        method: "POST",
      });
    }
  }, [xp, showProfilePopup, hasProfile, profilePopupShown, user]);

  // Default fallback animations for each unit if not specified in database
  const defaultRiveAnimations = {
    en: {
      0: ["/anju-3.riv"],
      1: ["/creative-2.riv"],
      2: ["/problem-1.riv"],
      3: ["/innovation.riv"],
    },
    hi: {
      0: ["/anju-3.riv"],
      1: ["/creative-2.riv"],
      2: ["/problem-1.riv"],
      3: ["/innovation.riv"],
    }
  };

  if (!series)
    return (
      <div className="p-6 flex justify-center items-center min-h-screen bg-white">
        <img
          src="https://d16ho1g3lqitul.cloudfront.net/sochuloading.gif"
          alt="Loading..."
          className="w-48 h-48 object-contain"
        />
      </div>
    );

  return (
    <div className="min-h-screen bg-white pt-4 pb-32 px-4 overflow-x-hidden relative">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-white py-3 z-50">
        <div className="flex items-center gap-6">
          <CircleArrowLeft
            onClick={() => navigate("/learn")}
            className="text-gray-400 hover:text-red-500"
          />
          <div className="flex items-center gap-2">
            <img
              src="https://d16ho1g3lqitul.cloudfront.net/india.svg"
              alt="lang"
              className="w-7 h-7 cursor-pointer"
              onClick={() => setShowLangModal(true)}
            />
            {language === "en" && (
              <span className="ml-3 font-bold text-gray-400">English</span>
            )}
            {language === "hi" && (
              <span className="ml-3">हिंदी</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm font-bold">
          <span className="text-orange-500">⚡ {xp}</span>
          <span className="text-red-500">❤️ {hearts}</span>
        </div>
      </div>

      {series.units.map((unit, unitIndex) => {
        const canAccessUnit = isSubscribed || unitIndex === 0;
        const unitCompleted = isUnitCompleted(unitIndex);
        
        // UPDATED: Use custom colors for completed units
        const bgColor = unitCompleted ? "#FFC200" : (unit.themeColor || "#009aef");
        const borderColor = unitCompleted ? "#F49000" : (unit.borderBottomColor || "#006bb6");
        
        // Character counter for this unit - resets for each unit
        let characterCount = 0;
        
        // Get the Rive animations for this unit (returns array of animations)
        const getRiveAnimations = () => {
          // First try to get from database
          if (unit.riveAnimations && unit.riveAnimations[language] && unit.riveAnimations[language].length > 0) {
            return unit.riveAnimations[language];
          }
          // Fallback to default animations
          return defaultRiveAnimations[language][unitIndex] || ["/anju-3.riv"];
        };

        return (
          <div 
            key={unitIndex} 
            className="mb-12"
            ref={(el) => {
              if (el) unitRefs.current[unitIndex] = el;
            }}
          >
            <div
              className={`text-white rounded-xl px-6 py-5 flex justify-between items-center shadow-lg mb-6 border-b-4 ${
                unitCompleted ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: bgColor,
                borderBottomColor: borderColor,
                // UPDATED: Custom ring color for completed units
                ...(unitCompleted && { 
                  boxShadow: `0 0 0 2px #FFC200, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)` 
                })
              }}
            >
              <div className="flex items-center gap-3">
                <div>
                  <h2 className={`text-xl font-bold ${unitCompleted ? 'text-black' : 'text-white'}`}>
                    {unit.title?.[language]}
                  </h2>
                  <p className={`text-sm opacity-90 ${unitCompleted ? 'text-gray-800' : 'text-white'}`}>
                    {unit.subtitle?.[language]}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setPopupData({
                    image: unit.particularUnitImageTest?.[language],
                    text: unit.particularUnitDesc?.[language],
                  })
                }
                className="relative flex items-center bg-white border-b-4 border-gray-400 rounded-lg shadow-md active:translate-y-[2px] active:shadow-sm transition-all px-1 py-2"
              >
                <Notebook className="w-7 h-7 text-gray-400" />
              </button>
            </div>

            <div className="relative flex flex-col items-center">
              {unit.lessons.map((lesson, lessonIndex) => {
                const rightShift = Math.sin((lessonIndex * Math.PI) / 3) * 50;
                const nextRightShift =
                  lessonIndex < unit.lessons.length - 1
                    ? Math.sin(((lessonIndex + 1) * Math.PI) / 3) * 50
                    : rightShift;

                let globalIndex = 0;
                for (let i = 0; i < unitIndex; i++) {
                  globalIndex += series.units[i].lessons.length;
                }
                globalIndex += lessonIndex;

                const isUnlocked = unlockedLessons.includes(globalIndex);
                const isCompleted = globalIndex < Math.max(...unlockedLessons);

                // Enhanced character display logic
                let shouldShowCharacter = false;
                let characterPosition = 0;
                let characterDirection = 1;
                let animationIndex = 0;

                // Show character at curve points - adjusted for sine wave pattern
                if (lessonIndex < unit.lessons.length - 1) {
                  const currentShift = rightShift;
                  const nextShift = nextRightShift;

                  const isAtCurvePeak =
                    Math.abs(currentShift) > Math.abs(nextShift) &&
                    Math.abs(currentShift) > 25;
                  const isAtCurveBottom =
                    Math.abs(currentShift) < Math.abs(nextShift) &&
                    Math.abs(nextShift) > 25;

                  const shouldShowAtInterval =
                    lessonIndex >= 2 && (lessonIndex - 2) % 3 === 0;

                  if (
                    shouldShowAtInterval &&
                    (isAtCurvePeak || isAtCurveBottom)
                  ) {
                    shouldShowCharacter = true;
                    
                    // FIXED: Use characterCount to alternate between animations
                    const animations = getRiveAnimations();
                    animationIndex = characterCount % animations.length;
                    characterCount++; // Increment for next character appearance
                    
                    if (currentShift > 0) {
                      characterPosition = currentShift - 140;
                      characterDirection = 1;
                    } else {
                      characterPosition = currentShift + 120;
                      characterDirection = -1;
                    }
                  }
                }

                // Get the specific animation for this character appearance
                const animations = getRiveAnimations();
                const selectedAnimation = animations[animationIndex] || animations[0];

                return (
                  <div
                    key={lessonIndex}
                    className="relative flex justify-center w-full"
                    style={{ marginTop: lessonIndex === 0 ? 0 : 24 }}
                    ref={(el) => {
                      if (el) lessonRefs.current[`${unitIndex}-${lessonIndex}`] = el;
                    }}
                  >
                    {/* Character Image - appears only at proper curve points with unit-specific animation */}
                    {shouldShowCharacter && selectedAnimation && (
                      <div
                        className="absolute -top-[110px] z-10 pl-7"
                        style={{
                          transform: `translateX(${characterPosition}px)`,
                          width: "200px",
                          height: "200px",
                        }}
                      >
                        <Rive
                          src={selectedAnimation}
                          stateMachines="State Machine 1"
                          style={{
                            transform: `scaleX(${characterDirection})`,
                          }}
                          onLoadError={(error) => {
                            console.warn(`Failed to load Rive animation: ${selectedAnimation}`, error);
                          }}
                        />
                      </div>
                    )}

                    {/* Lesson Button with flat design and active lesson ring */}
                    <button
                      disabled={!canAccessUnit || !isUnlocked}
                      onClick={() =>
                        navigate(
                          `/lesson/${slug}/lesson-${unitIndex + 1}-${
                            lessonIndex + 1
                          }`
                        )
                      }
                      className="relative z-20 transition-all duration-300 "
                      style={{ transform: `translateX(${rightShift}px)` }}
                    >
                      {/* IMPROVED: Animated ring for active lesson with better styling */}
                      {isActiveLesson(unitIndex, lessonIndex+1) && (
                        <div className="absolute -inset-0 rounded-full border-2 border-[#58cc02] animate-ping opacity-80 z-10 shadow-lg bg-[#58cc02]"></div>
                      )}
                      
                      <div
                        className={`w-[70px] h-[70px] rounded-full flex items-center justify-center text-white font-bold text-xl transition-all duration-300 ease-out relative z-20 ${
                          canAccessUnit && isUnlocked
                            ? "hover:scale-[1.03] active:translate-y-[6px] active:shadow-sm active:scale-95"
                            : "cursor-not-allowed"
                        }`}
                        style={{
                          backgroundColor:
                            canAccessUnit && isUnlocked
                              ? bgColor
                              : "#d1d5db",
                          boxShadow:
                            canAccessUnit && isUnlocked
                              ? `0 6px 0 ${borderColor}`
                              : `0 6px 0 #6b7280`,
                        }}
                      >
                        {isCompleted ? (
                          <img
                            src="https://d16ho1g3lqitul.cloudfront.net/done2.svg"
                            alt="Completed"
                            className="w-12 h-12"
                          />
                        ) : (
                          <img
                            src="https://d16ho1g3lqitul.cloudfront.net/star2.svg"
                            alt="Not completed"
                            className="w-8 h-8"
                          />
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Popup for image */}
      {popupData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[200] flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm relative text-center">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              onClick={() => {
                const audio = new Audio("/sounds/click.mp3");
                audio.play();
                setPopupData(null);
              }}
            >
              <X size={24} />
            </button>
            <img
              src={popupData.image}
              alt="Unit Popup"
              className="w-full rounded-lg mb-4"
            />
            <p className="text-sm text-gray-600">{popupData.text}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white shadow-md p-2 pt-3 z-50"
        style={{ boxShadow: "0 -1px 4px rgba(0, 0, 0, 0.05)" }}
      >
        <div className="flex justify-around items-center text-gray-600 pb-3">
          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3");
              audio.play();
              handleFooterClick("broadcasts");
            }}
            className={`flex flex-col items-center ${
              selected === "broadcasts" ? "text-blue-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "broadcasts"
                  ? "/sochumenuselectednew.png"
                  : "/sochumenuunselectednew.png"
              }
              alt="Broadcast"
              className="h-14 w-14"
            />
            <span className="text-xs">Learn</span>
          </button>
          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3");
              audio.play();
              handleFooterClick("leaderboard");
            }}
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
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3");
              audio.play();
              handleFooterClick("entertainment");
            }}
            className={`flex flex-col items-center ${
              selected === "entertainment" ? "text-green-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "entertainment"
                  ? "/rajumenuselectednew.png"
                  : "/rajumenuunselectednew.png"
              }
              alt="Entertainment"
              className="h-14 w-14"
            />
            <span className="text-xs">Entertainment</span>
          </button>
          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3");
              audio.play();
              handleFooterClick("bedtime");
            }}
            className={`flex flex-col items-center ${
              selected === "entertainment" ? "text-green-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "bedtime"
                  ? "/robermenuselected.png"
                  : "/robertmenuunselected.png"
              }
              alt="Bedtime"
              className="h-14 w-14"
            />
            <span className="text-xs">Bedtime</span>
          </button>
          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3");
              audio.play();
              handleFooterClick("learn");
            }}
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

      {showLangModal && <LanguageModal close={() => setShowLangModal(false)} />}
      {showProfilePopup && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-3 text-xl text-gray-500"
              onClick={() => setShowProfilePopup(false)}
            >
              ×
            </button>
            <XPProfileForm
              userId={user.id}
              onClose={() => setShowProfilePopup(false)}
              setHasProfile={setHasProfile}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesDetail;