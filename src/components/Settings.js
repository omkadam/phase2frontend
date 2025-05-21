import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Settings, Edit, Camera } from "lucide-react";

const Setting = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [selected, setSelected] = useState("setting");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [userProfile, setUserProfile] = useState({
    name: "",
    username: "",
    joined: "",
    friends: 1,
    profilePicture: null,
    dob: null
  });

  const [userProgress, setUserProgress] = useState({
    hearts: 0,
    totalXP: 0
  });

  // Function to format date
  const formatJoinedDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Function to fetch user progress data (hearts and XP)
  const fetchUserProgress = async (slug, userId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/series/${slug}/progress/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setUserProgress({
        hearts: data.hearts || 0,
        totalXP: data.totalXP || data.xp || 0
      });
      
    } catch (error) {
      console.error("Error fetching user progress:", error);
      // Set default values if API fails
      setUserProgress({
        hearts: 0,
        totalXP: 0
      });
    }
  };

  // Function to fetch user profile data
  // Function to fetch user profile data
const fetchUserProfile = async (userId) => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await fetch(`http://localhost:3001/api/user-profile/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Update user profile with fetched data
    setUserProfile(prevProfile => ({
      ...prevProfile,
      name: data.name || user?.fullName || "User",
      username: data.username || user?.username || "username",
      joined: formatJoinedDate(data.dob || data.createdAt || new Date()),
      profilePicture: data.profileImage || user?.profileImageUrl || null, // Update with fetched image URL
      dob: data.dob
    }));
    
  } catch (error) {
    console.error("Error fetching user profile:", error);
    setError(error.message);
    
    // Fallback to user data from Clerk if API fails
    setUserProfile(prevProfile => ({
      ...prevProfile,
      name: user?.fullName || "User",
      username: user?.username || "username",
      joined: "Recent",
      profilePicture: user?.profileImageUrl || null
    }));
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    // Fetch user profile data when component mounts or user changes
    if (user && user.id) {
      fetchUserProfile(user.id);
      
      // Fetch user progress data (you need to provide the slug)
      // Replace 'your-series-slug' with the actual series slug you want to fetch progress for
      // You might want to store this in state or get it from props/params
      const defaultSlug = 'pause-with-5-breaths'; // Update this with your actual slug
      fetchUserProgress(defaultSlug, user.id);
    } else if (user) {
      // If user exists but no ID, set loading to false and use available data
      setLoading(false);
      setUserProfile(prevProfile => ({
        ...prevProfile,
        name: user.fullName || "User",
        username: user.username || "username",
        profilePicture: user.profileImageUrl || null
      }));
    }
  }, [user]);

  const handleFooterClick = (page) => {
    setSelected(page);
    navigate(`/${page}`);
  };

  // Loading component
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error component (still shows partial UI)
  if (error && !userProfile.name) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading profile: {error}</p>
          <button 
            onClick={() => {
              if (user?.id) {
                fetchUserProfile(user.id);
                const defaultSlug = 'your-series-slug';
                fetchUserProgress(defaultSlug, user.id);
              }
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm py-4 px-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-700">Profile</h1>
        {/* <button className="p-2 hover:bg-gray-100 rounded-full">
          <Settings size={24} className="text-gray-600" />
        </button> */}
      </div>

      {/* Profile Section */}
      <div className="bg-white mx-4 mt-4 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-blue-100 p-8 relative">
          {/* Edit Button */}
          <button className="absolute top-4 right-4 bg-white/80 p-2 rounded-lg hover:bg-white">
            <Edit size={20} className="text-gray-600" />
          </button>
          
          {/* Profile Avatar */}
          <div className="flex justify-center">
  <div className="relative">
    {userProfile.profilePicture ? (
      <img 
        src={userProfile.profilePicture} 
        alt="Profile" 
        className="w-32 h-32 rounded-full border-4 border-dashed border-blue-300 cursor-pointer"
        onClick={() => document.getElementById("profileImageInput").click()}
      />
    ) : (
      <div 
        className="w-32 h-32 bg-blue-300 rounded-full border-4 border-dashed border-blue-400 flex items-center justify-center cursor-pointer"
        onClick={() => document.getElementById("profileImageInput").click()}
      >
        <Camera size={32} className="text-white" />
      </div>
    )}
    <input
      type="file"
      id="profileImageInput"
      accept="image/*"
      style={{ display: "none" }}
      onChange={async (e) => {
        const file = e.target.files[0];
        if (file) {
          const formData = new FormData();
          formData.append("profileImage", file);

          try {
            const response = await fetch(`http://localhost:3001/api/user-profile/${user.id}/upload`, {
              method: "POST",
              body: formData,
            });

            if (!response.ok) throw new Error("Image upload failed");

            const data = await response.json();
            setUserProfile((prev) => ({
              ...prev,
              profilePicture: data.profileImage,
            }));

            alert("Profile picture updated successfully!");
          } catch (err) {
            console.error("Error uploading image:", err);
            alert("Failed to upload image. Please try again.");
          }
        }
      }}
    />
  </div>
</div>
        </div>
        
        {/* User Info */}
        <div className="px-6 py-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">{userProfile.name}</h2>
            <p className="text-gray-600">{userProfile.username}</p>
            <p className="text-gray-500 text-sm mt-1">Joined {userProfile.joined}</p>
          </div>
          
          <div className="flex justify-center items-center">
            {/* <span className="text-blue-500 font-semibold">{userProfile.friends} Friend</span> */}
            <img src="https://d16ho1g3lqitul.cloudfront.net/india.svg" alt="India Flag" className="w-6 h-4 rounded" />
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="px-4 mt-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Statistics</h3>
        
        <div className="flex gap-4">
          {/* Hearts */}
          <div className="bg-white rounded-xl p-4 flex-1 shadow-sm">
            <div className="flex items-center mb-2">
              <span className="text-2xl">❤️</span>
              <span className="text-xl font-bold ml-2">{userProgress.hearts}</span>
            </div>
            <p className="text-gray-600 text-sm">Hearts</p>
          </div>
          
          {/* Total XP */}
          <div className="bg-white rounded-xl p-4 flex-1 shadow-sm">
            <div className="flex items-center mb-2">
              <span className="text-2xl">⚡</span>
              <span className="text-xl font-bold ml-2">{userProgress.totalXP}</span>
            </div>
            <p className="text-gray-600 text-sm">Total XP</p>
          </div>
        </div>
      </div>

      {/* Error message (if any) */}
      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">
            Note: Some profile data couldn't be loaded. Using available information.
          </p>
        </div>
      )}

      {/* Achievement Badges */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md p-2 pt-2 z-50"> 
        <div className="flex justify-around items-center text-gray-600">
          <button
            onClick={() => handleFooterClick("learn")}
            className={`flex flex-col items-center ${
              selected === "broadcasts" ? "text-blue-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "learn"
                  ? "/sochumenuselectednew.png"
                  : "/sochumenuunselectednew.png"
              }
              alt="Broadcast"
              className="h-14 w-14"
            />
            <span className="text-xs">Home</span>
          </button>

          <button
            onClick={() => handleFooterClick("leaderboard")}
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
            onClick={() => handleFooterClick("broadcasts")}
            className={`flex flex-col items-center ${
              selected === "entertainment" ? "text-green-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "broadcasts"
                  ? "/rajumenuselectednew.png"
                  : "/rajumenuunselectednew.png"
              }
              alt="Entertainment"
              className="h-14 w-14"
            />
            <span className="text-xs">Entertainment</span>
          </button>

          <button
            onClick={() => handleFooterClick("setting")}
            className={`flex flex-col items-center ${
              selected === "learn" ? "text-pink-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "setting"
                  ? "/anjumenuselectednew.png"
                  : "/anjumenuselectednew.png"
              }
              alt="setting"
              className="h-14 w-14"
            />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Setting;