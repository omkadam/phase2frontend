import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  X,
  Mic,
  Book,
  Speaker,
  Volume2,
  VolumeX,
  CircleChevronLeft,
  CircleChevronRight,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const BookReader = ({ pages = [], onNext }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showDictionary, setShowDictionary] = useState(false);
  const [showSpeakPopup, setShowSpeakPopup] = useState(false);
  const [speechMatched, setSpeechMatched] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const touchStartX = useRef(null);
  const permissionGranted = useRef(false);
  const recognitionTimeout = useRef(null);
  const silenceTimeout = useRef(null);

  const navigate = useNavigate();
  const { seriesSlug } = useParams();
  const { user } = useUser();

  // Detect if device is tablet/iPad
  useEffect(() => {
    const checkDevice = () => {
      const isTabletDevice = window.innerWidth >= 768 && window.innerHeight >= 1024;
      const isIPad = /iPad|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;
      setIsTablet(isTabletDevice || isIPad);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Enhanced speech recognition support detection
  useEffect(() => {
    const checkSpeechSupport = () => {
      const userAgent = navigator.userAgent;
      const isIOS = /iPhone|iPad|iPod/.test(userAgent);
      const isMacOS = /Macintosh/.test(userAgent);
      const isAppleDevice = isIOS || isMacOS;
      
      setIsIOSDevice(isAppleDevice);
      
      // Check if running in standalone mode (PWA)
      const isStandalone = window.navigator.standalone === true;
      
      // Check if running in WebView
      const isWebView = isIOS && (
        window.navigator.standalone ||
        window.matchMedia('(display-mode: standalone)').matches ||
        document.referrer.includes('android-app://') ||
        window.location.href.includes('capacitor://') ||
        // Additional WebView detection
        !window.safari ||
        navigator.userAgent.includes('CriOS') || // Chrome on iOS
        navigator.userAgent.includes('FxiOS') || // Firefox on iOS
        navigator.userAgent.includes('EdgiOS')   // Edge on iOS
      );

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const hasAPI = !!SpeechRecognition;
      
      // More restrictive check for iOS
      let isSupported = false;
      
      if (isIOS) {
        // On iOS, speech recognition only works in Safari (not in WebView/PWA)
        const isSafari = /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS/.test(userAgent);
        isSupported = hasAPI && isSafari && !isStandalone && !isWebView;
      } else if (isMacOS) {
        // On macOS, works in most browsers
        isSupported = hasAPI;
      } else {
        // On other platforms, check API availability
        isSupported = hasAPI;
      }
      
      setSpeechSupported(isSupported);
      
      console.log('Speech Recognition Detection:', {
        userAgent,
        isIOS,
        isMacOS,
        isAppleDevice,
        isStandalone,
        isWebView,
        hasAPI,
        isSupported,
        safari: /Safari/.test(userAgent),
        chrome: /CriOS/.test(userAgent),
        firefox: /FxiOS/.test(userAgent),
        edge: /EdgiOS/.test(userAgent)
      });
    };

    checkSpeechSupport();
  }, []);

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
      await fetch(
        `https://sochu.online/api/series/${seriesSlug}/progress/${user.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ xpChange: 10, heartChange: 0 }),
        }
      );
      if (onNext) onNext();
    }
  };

  const handleClose = () => navigate(-1);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX.current;
    if (diff > 50) handlePrevPage();
    else if (diff < -50) handleNextPage();
  };

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    clickX < rect.width / 2 ? handlePrevPage() : handleNextPage();
  };

  const toggleAudio = () => {
    const clickSound = new Audio("/sounds/click.mp3");
    clickSound.play().catch(() => {});

    const newVal = !audioEnabled;
    setAudioEnabled(newVal);

    if (!newVal && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playAudioForCurrentPage();
    }
  };

  const toggleDictionary = () => setShowDictionary((prev) => !prev);
  
  const toggleSpeakPopup = async () => {
    // Enhanced error messaging for Apple devices
    if (!speechSupported) {
      if (isIOSDevice) {
        alert('Speech recognition is not available. On iOS devices, this feature only works in Safari browser (not in apps or other browsers). Please open this page in Safari to use speech recognition.');
      } else {
        alert('Speech recognition is not available on this device. This feature works best in Chrome, Safari, or Edge browsers.');
      }
      return;
    }

    // Try to get speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showTextInputFallback();
      return;
    }

    // Request microphone permission
    try {
      await requestMicrophonePermission();
      setShowSpeakPopup(true);
      setSpeechMatched(false);
    } catch (error) {
      console.error('Microphone permission denied:', error);
      if (isIOSDevice) {
        alert('Microphone access is required for speech recognition. Please enable microphone access in Safari settings and try again.');
      } else {
        alert('Microphone access is required for speech recognition. Please enable it in your browser settings.');
      }
    }
  };

  const showTextInputFallback = () => {
    const expectedText = pages[currentPage]?.speakText || "";
    const userInput = prompt(`Speech recognition not available. Type this text: "${expectedText}"`);
    
    if (userInput) {
      const similarity = calculateTextSimilarity(userInput.toLowerCase().trim(), expectedText.toLowerCase().trim());
      if (similarity >= 0.5) {
        setSpeechMatched(true);
        setShowSpeakPopup(true);
        setTimeout(() => {
          setSpeechMatched(false);
          setShowSpeakPopup(false);
        }, 5000); // Changed from 2000ms to 5000ms (5 seconds)
      } else {
        alert("Text doesn't match well enough. Try again!");
      }
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Add sample rate for better iOS compatibility
        }
      });
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      permissionGranted.current = true;
      return true;
    } catch (error) {
      permissionGranted.current = false;
      throw error;
    }
  };

  const calculateTextSimilarity = (text1, text2) => {
    const words1 = text1.replace(/[^\w\s]/gi, "").split(/\s+/).filter(w => w.length > 0);
    const words2 = text2.replace(/[^\w\s]/gi, "").split(/\s+/).filter(w => w.length > 0);
    
    let matches = 0;
    words1.forEach(word => {
      if (words2.includes(word)) matches++;
    });
    
    return words1.length > 0 ? matches / words1.length : 0;
  };

  const playAudioForCurrentPage = () => {
    const currentAudio = pages[currentPage]?.audio;
    if (audioRef.current && currentAudio && audioEnabled) {
      audioRef.current.src = currentAudio;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Autoplay error:", err);
          setIsPlaying(false);
        });
    }
  };

  useEffect(() => {
    // Play flip.mp3 ONLY when page changes
    if (currentPage !== 0) {
      const pageChangeSound = new Audio("/sounds/flip.mp3");
      pageChangeSound.play().catch(() => {});
    }

    // Stop previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }

    // Play new page audio after delay (if audio is enabled)
    const timeout = setTimeout(() => {
      if (audioEnabled) {
        playAudioForCurrentPage();
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [currentPage]);

  const startRecognition = async () => {
    let expected = pages[currentPage]?.speakText || "";
    
    if (!expected.trim()) {
      alert("No text available for this page.");
      return;
    }

    // Normalize expected sentence
    expected = expected.toLowerCase().trim().replace(/[^\w\s]/gi, "");
    const expectedWords = expected.split(/\s+/).filter(word => word.length > 0);

    // Final check for Speech Recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showTextInputFallback();
      return;
    }

    try {
      // Ensure microphone permission
      if (!permissionGranted.current) {
        await requestMicrophonePermission();
      }

      const recognition = new SpeechRecognition();
      
      // Enhanced configuration for better slow speech handling
      recognition.lang = "en-US";
      recognition.interimResults = true; // Enable interim results to keep connection alive
      recognition.maxAlternatives = 5;
      recognition.continuous = true; // Allow continuous listening for slow speakers
      
      // iOS-specific settings
      if (isIOSDevice) {
        recognition.grammars = null;
      }
      
      // Clear any existing timeouts
      if (recognitionTimeout.current) {
        clearTimeout(recognitionTimeout.current);
      }
      if (silenceTimeout.current) {
        clearTimeout(silenceTimeout.current);
      }

      setIsRecording(true);
      let finalTranscript = "";
      let hasStartedSpeaking = false;
      let lastSpeechTime = Date.now();
      let wordCount = 0;

      recognition.onstart = () => {
        console.log('Speech recognition started successfully');
        
        // Standard timeout (60 seconds total) as backup
        const timeoutDuration = isIOSDevice ? 55000 : 60000; // 60 seconds
        recognitionTimeout.current = setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
            if (!hasStartedSpeaking) {
              alert('No speech detected. Please try again and speak clearly into the microphone.');
            } else {
              alert('Speech recognition timed out. Please try again.');
            }
          }
        }, timeoutDuration);
      };

      recognition.onresult = (event) => {
        console.log('Speech recognition results received');
        
        let interimTranscript = "";
        let currentFinalTranscript = "";
        
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            currentFinalTranscript += transcript;
            hasStartedSpeaking = true;
          } else {
            interimTranscript += transcript;
            hasStartedSpeaking = true;
          }
        }
        
        // Update final transcript
        if (currentFinalTranscript) {
          finalTranscript += currentFinalTranscript;
          // Count words in final transcript
          const currentWords = finalTranscript.toLowerCase().trim().replace(/[^\w\s]/gi, "").split(/\s+/).filter(word => word.length > 0);
          wordCount = currentWords.length;
        }
        
        // Update last speech time when we get any speech (interim or final)
        if (interimTranscript || currentFinalTranscript) {
          lastSpeechTime = Date.now();
          
          // Clear existing silence timeout
          if (silenceTimeout.current) {
            clearTimeout(silenceTimeout.current);
          }
          
          // Simple 3-second timeout after any speech
          console.log('Setting 3-second silence timeout');
          
          // Set 3-second silence timeout
          silenceTimeout.current = setTimeout(() => {
            if (recognitionRef.current && finalTranscript.trim()) {
              console.log('Ending recognition due to 3 seconds of silence');
              recognitionRef.current.stop();
            }
          }, 3000); // Fixed 3-second timeout
        }
        
        // Check if we have enough speech to evaluate (but don't auto-stop unless very confident)
        if (finalTranscript.trim()) {
          const normalized = finalTranscript.toLowerCase().trim().replace(/[^\w\s]/gi, "");
          const similarity = calculateTextSimilarity(normalized, expected);
          
          console.log('Current transcript:', finalTranscript, 'Similarity:', similarity, 'Words:', wordCount, '/', expectedWords.length);
          
          // Remove auto-stop logic - let the 3-second timeout handle everything
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended, final transcript:', finalTranscript);
        
        // Clear all timeouts
        if (recognitionTimeout.current) {
          clearTimeout(recognitionTimeout.current);
        }
        if (silenceTimeout.current) {
          clearTimeout(silenceTimeout.current);
        }
        
        setIsRecording(false);
        
        // Process final result with more lenient thresholds
        if (finalTranscript.trim()) {
          const normalized = finalTranscript.toLowerCase().trim().replace(/[^\w\s]/gi, "");
          const similarity = calculateTextSimilarity(normalized, expected);
          
          console.log('Final evaluation - Transcript:', finalTranscript, 'Similarity:', similarity);
          
          // More lenient threshold for final evaluation
          const threshold = isIOSDevice ? 0.3 : 0.4;
          if (similarity >= threshold) {
            setSpeechMatched(true);
            setTimeout(() => {
              setShowSpeakPopup(false);
              setSpeechMatched(false);
            }, 5000); // Changed from 1000ms to 5000ms (5 seconds)
          } else {
            // Provide more helpful feedback
            const spokenWords = normalized.split(/\s+/).filter(word => word.length > 0);
            const expectedWordsList = expectedWords.join(' ');
            alert(`Good try! You said: "${finalTranscript.trim()}"\n\nExpected: "${pages[currentPage]?.speakText}"\n\nTry to match the words more closely. Take your time!`);
          }
        } else if (hasStartedSpeaking) {
          alert('Could not understand what you said. Please try speaking more clearly and take your time.');
        } else {
          alert('No speech detected. Please try again and speak into the microphone. You have plenty of time!');
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error, event);
        
        // Clear timeouts
        if (recognitionTimeout.current) {
          clearTimeout(recognitionTimeout.current);
        }
        if (silenceTimeout.current) {
          clearTimeout(silenceTimeout.current);
        }
        
        setIsRecording(false);
        
        // Enhanced error handling for Apple devices
        switch(event.error) {
          case 'not-allowed':
            if (isIOSDevice) {
              alert('Microphone permission denied. Please enable microphone access in Safari settings: Settings > Safari > Microphone, then refresh this page.');
            } else {
              alert('Microphone permission denied. Please enable microphone access in your browser settings and try again.');
            }
            break;
          case 'no-speech':
            alert('No speech detected. Please speak clearly and try again.');
            break;
          case 'audio-capture':
            alert('No microphone found. Please check your device microphone and try again.');
            break;
          case 'network':
            alert('Network error. Please check your internet connection and try again.');
            break;
          case 'service-not-allowed':
            if (isIOSDevice) {
              alert('Speech recognition service not available. Please make sure you are using Safari browser and have a stable internet connection.');
            } else {
              alert('Speech recognition service not available. Please try again later.');
            }
            break;
          case 'language-not-supported':
            alert('Language not supported. Please try again.');
            break;
          case 'aborted':
            // User likely stopped it, don't show error
            console.log('Recognition was aborted by user');
            break;
          default:
            console.log('Falling back to text input due to error:', event.error);
            showTextInputFallback();
        }
      };

      // Store reference and start
      recognitionRef.current = recognition;
      
      // Add a small delay before starting (helps with iOS)
      setTimeout(() => {
        if (recognitionRef.current) {
          recognition.start();
        }
      }, 100);
      
    } catch (error) {
      console.error('Recognition setup error:', error);
      setIsRecording(false);
      showTextInputFallback();
    }
  };

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (recognitionTimeout.current) {
        clearTimeout(recognitionTimeout.current);
      }
      if (silenceTimeout.current) {
        clearTimeout(silenceTimeout.current);
      }
    };
  }, []);

  // Responsive button size based on device
  const buttonSize = isTablet ? "w-16 h-16" : "w-12 h-12";
  const iconSize = isTablet ? "w-8 h-8" : "w-6 h-6";

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      {/* Progress Bar */}
      <div className={`absolute top-4 z-50 flex items-center justify-center gap-4 ${
        isTablet ? 'left-8 right-8' : 'left-4 right-4'
      }`}>
        <div className="h-3 w-3/4 bg-white rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all rounded-full"
            style={{
              width: `${
                pages.length > 0 ? ((currentPage + 1) / pages.length) * 100 : 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* Page Image */}
      <div
        className="w-full h-full flex items-center justify-center cursor-pointer select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <img
          src={pages[currentPage]?.image}
          alt={`Page ${currentPage + 1}`}
          className={`w-full h-full ${isTablet ? 'object-contain' : 'object-cover'}`}
          draggable={false}
        />
      </div>

      {/* Navigation Icons - Bottom Center */}
      <div className={`absolute z-50 flex items-center gap-4 ${
        isTablet ? 'bottom-12' : 'bottom-8'
      } left-1/2 transform -translate-x-1/2`}>
        {/* Previous Page Button */}
        {currentPage > 0 && (
          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3");
              audio.play().catch(() => {});
              handlePrevPage();
            }}
            className={`${buttonSize} bg-white rounded-full flex items-center justify-center transition-all duration-150 shadow-lg border-b-4 border-gray-600 active:translate-y-1 active:shadow-sm active:border-b-0`}
          >
            <ArrowLeft className={`text-black ${iconSize}`} />
          </button>
        )}

        {/* Next Page Button */}
        {currentPage < pages.length - 1 && (
          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3");
              audio.play().catch(() => {});
              handleNextPage();
            }}
            className={`${buttonSize} bg-white rounded-full flex items-center justify-center transition-all duration-150 shadow-lg border-b-4 border-gray-600 active:translate-y-1 active:shadow-sm active:border-b-0`}
          >
            <ArrowRight className={`text-black ${iconSize}`} />
          </button>
        )}

        {/* Complete Book Button */}
        {currentPage === pages.length - 1 && (
          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3");
              audio.play().catch(() => {});
              completeBook();
            }}
            className={`px-6 py-3 bg-green-500 text-white rounded-full flex items-center justify-center transition-all duration-150 shadow-lg border-b-4 border-green-700 active:translate-y-1 active:shadow-sm active:border-b-0 font-semibold ${
              isTablet ? 'text-lg' : 'text-base'
            }`}
          >
            Complete ✓
          </button>
        )}
      </div>

      {/* Enhanced Mic Button with better visual feedback */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          const audio = new Audio("/sounds/click.mp3");
          audio.play().catch(() => {});
          toggleSpeakPopup();
        }}
        className={`absolute z-50 ${buttonSize} rounded-full flex items-center justify-center transition-all duration-150 shadow-lg border-b-4 active:translate-y-1 active:shadow-sm active:border-b-0 ${
          speechSupported 
            ? 'bg-blue-400 border-blue-600' 
            : isIOSDevice 
              ? 'bg-gray-400 border-gray-600' 
              : 'bg-gray-400 border-gray-600'
        } ${isTablet ? 'bottom-36 left-8' : 'bottom-24 left-4'}`}
      >
        <Mic className={`text-white ${iconSize}`} />
      </button>

      {/* Close Button */}
      <button
        onClick={() => {
          const audio = new Audio("/sounds/click.mp3");
          audio.play().catch(() => {});
          handleClose();
        }}
        className={`absolute z-50 ${buttonSize} bg-yellow-400 rounded-full flex items-center justify-center transition-all duration-150 shadow-lg border-b-4 border-yellow-600 active:translate-y-1 active:shadow-sm active:border-b-0 ${
          isTablet ? 'bottom-12 left-8' : 'bottom-8 left-4'
        }`}
      >
        <span className={`text-black font-bold ${isTablet ? 'text-4xl' : 'text-3xl'}`}>X</span>
      </button>

      {/* Dictionary Button */}
      {(() => {
        const hasHardWords = pages[currentPage]?.hardWords?.length > 0;

        return (
          <button
            onClick={() => {
              if (!hasHardWords) return;
              const audio = new Audio("/sounds/click.mp3");
              audio.play().catch(() => {});
              toggleDictionary();
            }}
            disabled={!hasHardWords}
            className={`absolute z-50 ${buttonSize} rounded-full flex items-center justify-center transition-all duration-150 shadow-lg border-b-4 ${
              isTablet ? 'bottom-36 right-8' : 'bottom-24 right-4'
            } ${
              hasHardWords
                ? "bg-red-600 border-red-900 active:translate-y-1 active:shadow-sm active:border-b-0"
                : "bg-gray-300 border-gray-300 cursor-not-allowed"
            }`}
          >
            <Book className={`text-white ${iconSize}`} />
          </button>
        );
      })()}

      {/* Dictionary Popup */}
      {showDictionary && (
        <div className={`absolute top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg max-h-60 overflow-auto ${
          isTablet ? 'w-96' : 'w-72'
        }`}>
          <h3 className={`text-center font-extrabold mb-2 ${isTablet ? 'text-xl' : 'text-lg'}`}>
            Glossary
          </h3>
          {pages[currentPage]?.hardWords?.length > 0 ? (
            <ul>
              {pages[currentPage].hardWords.map((word, i) => (
                <li key={i} className={`text-black mb-1 ${isTablet ? 'text-lg' : 'text-base'}`}>
                  {word}
                </li>
              ))}
            </ul>
          ) : (
            <p className={`text-gray-500 ${isTablet ? 'text-lg' : 'text-base'}`}>
              No hard words for this page.
            </p>
          )}
          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3");
              audio.play().catch(() => {});
              toggleDictionary();
            }}
            className={`w-full mt-4 px-4 py-2 bg-yellow-400 border-b-2 border-yellow-600 text-black font-bold rounded-md hover:bg-yellow-500 text-center active:translate-y-1 active:border-b-0 ${
              isTablet ? 'text-lg' : 'text-base'
            }`}
          >
            Close
          </button>
        </div>
      )}

      {/* Enhanced Speak Popup */}
      {showSpeakPopup && (
        <div className={`absolute top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-2xl shadow-2xl flex flex-col justify-between items-center text-center ${
          isTablet ? 'w-[600px] h-[400px]' : 'w-[90vw] max-w-md h-[320px]'
        }`}>
          {/* Close Button */}
          <div className="w-full flex justify-end">
            <button
              onClick={() => {
                const audio = new Audio("/sounds/click.mp3");
                audio.play().catch(() => {});
                setShowSpeakPopup(false);
                setIsRecording(false);
                if (recognitionRef.current) {
                  recognitionRef.current.stop();
                  recognitionRef.current = null;
                }
                if (recognitionTimeout.current) {
                  clearTimeout(recognitionTimeout.current);
                }
                if (silenceTimeout.current) {
                  clearTimeout(silenceTimeout.current);
                }
              }}
              className="text-gray-500 hover:text-black"
            >
              <X size={isTablet ? 32 : 24} />
            </button>
          </div>

          {/* Speak Instruction */}
          <div className="flex flex-col items-center">
            <h3 className={`font-bold mb-2 ${isTablet ? 'text-2xl' : 'text-lg'}`}>
              Say this:
            </h3>
            <p className={`text-black font-semibold mb-4 break-words px-4 ${
              isTablet ? 'text-2xl' : 'text-xl'
            }`}>
              {pages[currentPage]?.speakText || "No text"}
            </p>
            {!speechSupported && isIOSDevice && (
              <p className="text-orange-600 text-sm mb-2 text-center">
                Speech recognition requires Safari browser on iOS devices
              </p>
            )}
            {!speechSupported && !isIOSDevice && (
              <p className="text-orange-600 text-sm mb-2 text-center">
                Speech recognition not available - will use text input
              </p>
            )}
          </div>

          {/* Speak Button or Thumbs Up */}
          {speechMatched ? (
            <div className={`text-green-500 font-bold ${isTablet ? 'text-7xl' : 'text-5xl'}`}>
              👍
            </div>
          ) : (
            <button
              onClick={() => {
                const audio = new Audio("/sounds/click.mp3");
                audio.play().catch(() => {});
                startRecognition();
              }}
              disabled={isRecording}
              className={`${isTablet ? 'w-20 h-20' : 'w-16 h-16'} rounded-full bg-blue-500 border-b-4 border-blue-700 text-white flex items-center justify-center shadow-lg active:translate-y-[2px] active:border-b-0 transition-all duration-150 hover:bg-blue-600 ${
                isRecording ? "animate-pulse opacity-70" : ""
              } ${isRecording ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Mic className={isTablet ? 'w-9 h-9' : 'w-7 h-7'} />
            </button>
          )}
          
          {isRecording && (
            <p className="text-blue-600 text-sm mt-2">
              {isIOSDevice ? 'Listening... Take your time and speak clearly!' : 'Listening... Speak at your own pace!'}
            </p>
          )}
        </div>
      )}

      {/* Audio Toggle */}
      {pages[currentPage]?.audio && (
        <>
          <audio ref={audioRef} />
          <button
            onClick={toggleAudio}
            className={`absolute z-50 ${buttonSize} ${
              audioEnabled
                ? "bg-green-500 border-b-4 border-green-800"
                : "bg-gray-300 border-gray-600 cursor-not-allowed"
            } rounded-full flex items-center justify-center transition-all duration-150 shadow-lg ${
              audioEnabled
                ? "hover:bg-green-500 active:translate-y-1 active:shadow-sm active:border-b-0"
                : ""
            } ${isTablet ? 'bottom-12 right-8' : 'bottom-8 right-4'}`}
          >
            {audioEnabled ? (
              <Volume2 className={`text-white ${iconSize}`} />
            ) : (
              <VolumeX className={`text-white ${iconSize}`} />
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default BookReader;