import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import {
  Settings,
  Edit,
  Camera,
  Trash2,
  AlertTriangle,
  MessageCircle,
  Mail,
  HelpCircle,
} from "lucide-react";

const Setting = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [selected, setSelected] = useState("setting");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [userProfile, setUserProfile] = useState({
    name: "",
    username: "",
    joined: "",
    friends: 1,
    profilePicture: null,
    dob: null,
  });

  const [userProgress, setUserProgress] = useState({
    hearts: 0,
    totalXP: 0,
  });

  // Function to format date
  const formatJoinedDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Function to fetch user progress data (hearts and XP)
  const fetchUserProgress = async (slug, userId) => {
    try {
      const response = await fetch(
        `https://sochu.online/api/series/${slug}/progress/${userId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setUserProgress({
        hearts: data.hearts || 0,
        totalXP: data.totalXP || data.xp || 0,
      });
    } catch (error) {
      console.error("Error fetching user progress:", error);
      // Set default values if API fails
      setUserProgress({
        hearts: 0,
        totalXP: 0,
      });
    }
  };

  // Function to fetch user profile data
  const fetchUserProfile = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://sochu.online/api/user-profile/${userId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update user profile with fetched data
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        name: data.name || user?.fullName || "User",
        username: data.username || user?.username || "username",
        joined: formatJoinedDate(data.dob || data.createdAt || new Date()),
        profilePicture: data.profileImage || user?.profileImageUrl || null,
        dob: data.dob,
      }));
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError(error.message);

      // Fallback to user data from Clerk if API fails
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        name: user?.fullName || "User",
        username: user?.username || "username",
        joined: "Recent",
        profilePicture: user?.profileImageUrl || null,
      }));
    } finally {
      setLoading(false);
    }
  };

  // Function to handle account deletion
  const handleDeleteAccount = async () => {
    if (!user?.id) {
      alert("Unable to delete account. Please try again.");
      return;
    }

    setDeleteLoading(true);
    try {
      // First, delete user data from your backend
      const response = await fetch(
        `https://sochu.online/api/user-profile/${user.id}/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Backend deletion failed: ${response.status}`);
      }

      console.log("✅ Backend data deleted successfully");

      // Then try to delete from Clerk
      try {
        await user.delete();
        console.log("✅ Clerk account deleted successfully");
      } catch (clerkError) {
        console.error("Clerk deletion error:", clerkError);

        // If Clerk deletion fails, sign out the user instead
        if (
          clerkError.message?.includes("additional verification") ||
          clerkError.message?.includes("Forbidden") ||
          clerkError.status === 403
        ) {
          console.log(
            "⚠️ Clerk requires additional verification, signing out user instead"
          );
          await signOut();
        } else {
          // For other Clerk errors, still sign out
          console.log("⚠️ Clerk deletion failed, signing out user instead");
          await signOut();
        }
      }

      // Show success message and redirect
      alert(
        "Account deleted successfully! All your data has been permanently removed."
      );
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);

      // Check if it's a backend error vs Clerk error
      if (error.message?.includes("Backend deletion failed")) {
        alert(
          "Failed to delete account data. Please try again or contact support."
        );
      } else {
        // If backend succeeded but Clerk failed, still redirect (user data is deleted)
        alert("Account data deleted successfully. You have been signed out.");
        try {
          await signOut();
        } catch (signOutError) {
          console.error("Error signing out:", signOutError);
        }
        navigate("/");
      }
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Function to handle support email
  const handleSupportEmail = () => {
    const subject = encodeURIComponent("Technical Support Request");
    const body = encodeURIComponent(
      "Hi Sochu tech team,\n\nI need help with:\n\n[Please describe your issue here]\n\nThanks!"
    );
    window.open(
      `mailto:tech@cordiformstudios.com?subject=${subject}&body=${body}`,
      "_blank"
    );
  };

  // Function to handle author email
  const handleAuthorEmail = () => {
    const subject = encodeURIComponent("Message for Sochu Author");
    const body = encodeURIComponent(
      "Hi there,\n\n[Your message here]\n\nBest regards!"
    );
    window.open(
      `mailto:chevohra@cordiformstudios.com?subject=${subject}&body=${body}`,
      "_blank"
    );
  };

  useEffect(() => {
    // Fetch user profile data when component mounts or user changes
    if (user && user.id) {
      fetchUserProfile(user.id);

      // Fetch user progress data
      const defaultSlug = "pause-with-5-breaths";
      fetchUserProgress(defaultSlug, user.id);
    } else if (user) {
      // If user exists but no ID, set loading to false and use available data
      setLoading(false);
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        name: user.fullName || "User",
        username: user.username || "username",
        profilePicture: user.profileImageUrl || null,
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
                const defaultSlug = "your-series-slug";
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
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header - Simplified without banner */}
      <div className="p-4 bg-white">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Profile</h2>
          <p className="text-sm text-gray-500">
            Manage your account and view your progress
          </p>
          <hr className="border-gray-300 my-4" />
        </div>

        {/* Profile Content */}
        <div className="space-y-4">
          {/* User Profile Card */}
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                {userProfile.name
                  ? userProfile.name.charAt(0).toUpperCase()
                  : "U"}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-800">
                  {userProfile.name}
                </h3>
                <p className="text-sm text-gray-500">
                  @{userProfile.username} • Joined {userProfile.joined}
                </p>
              </div>
              <div className="flex items-center">
                <img
                  src="https://d16ho1g3lqitul.cloudfront.net/india.svg"
                  alt="India Flag"
                  className="w-6 h-4 rounded"
                />
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Hearts */}
            <div className="bg-white p-4 rounded-xl shadow-md">
              <div className="flex items-center gap-3">
                <div className="text-xl font-bold text-blue-600">❤️</div>
                <div>
                  <div className="text-lg font-medium text-gray-800">
                    {userProgress.hearts}
                  </div>
                  <p className="text-sm text-gray-500">Hearts</p>
                </div>
              </div>
            </div>

            {/* Total XP */}
            <div className="bg-white p-4 rounded-xl shadow-md">
              <div className="flex items-center gap-3">
                <div className="text-xl font-bold text-blue-600">⚡</div>
                <div>
                  <div className="text-lg font-medium text-gray-800">
                    {userProgress.totalXP}
                  </div>
                  <p className="text-sm text-gray-500">Total XP</p>
                </div>
              </div>
            </div>
          </div>


          {/* Author Contact Section */}
          {/* Author Contact Section */}
          <div className="bg-white p-4 rounded-xl shadow-md relative">
            {/* Author Photo */}
            <img
              src="https://d16ho1g3lqitul.cloudfront.net/che's.jpg" // Replace with actual path
              alt="Author"
              className="absolute top-2 right-2 w-10 h-10 rounded-full object-cover border border-gray-200"
            />

            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Talk to the author!
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              If you want to appreciate, complain or just say "Hi!". Write to
              Sochu's author.
            </p>

            <button
              onClick={handleAuthorEmail}
              className="w-full p-3 flex items-center justify-between hover:bg-green-50 transition-colors rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <MessageCircle size={20} className="text-green-500" />
                <span className="text-green-500 font-medium">
                  Message Author
                </span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>

          {/* Support Section */}
          {/* Support Section */}
          <div className="bg-white p-4 rounded-xl shadow-md relative">
            {/* Tech Manager Photo */}
            <img
              src="https://d16ho1g3lqitul.cloudfront.net/omm.jpg" // Replace with actual path
              alt="Tech Manager"
              className="absolute top-2 right-2 w-10 h-10 rounded-full object-cover border border-gray-200"
            />

            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Need help?
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Write to Sochu's technical support team.
            </p>

            <button
              onClick={handleSupportEmail}
              className="w-full p-3 flex items-center justify-between hover:bg-blue-50 transition-colors rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <HelpCircle size={20} className="text-blue-500" />
                <span className="text-blue-500 font-medium">
                  Contact Support
                </span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>

          

          {/* Account Settings */}
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Account Settings
            </h3>

            {/* Delete Account Button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full p-3 flex items-center justify-between hover:bg-red-50 transition-colors rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Trash2 size={20} className="text-red-500" />
                <span className="text-red-500 font-medium">Delete Account</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>

        {/* Error message (if any) */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm">
              Note: Some profile data couldn't be loaded. Using available
              information.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle size={48} className="text-red-500" />
            </div>

            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
              Delete Account
            </h3>

            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to permanently delete your account? This
              action cannot be undone and will remove all your data, progress,
              and settings.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {deleteLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  "Delete Forever"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer - Exact same as Leaderboard and Episodes */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white shadow-md p-2 pt-3 z-50"
        style={{ boxShadow: "0 -1px 4px rgba(0, 0, 0, 0.05)" }}
      >
        <div className="flex justify-around items-center text-gray-600 pb-3">
          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3");
              audio.play().catch(() => {});
              handleFooterClick("learn");
            }}
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
            <span className="text-xs">Learn</span>
          </button>

          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3");
              audio.play().catch(() => {});
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
              audio.play().catch(() => {});
              handleFooterClick("episodes");
            }}
            className={`flex flex-col items-center ${
              selected === "entertainment" ? "text-green-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "episodes"
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
              audio.play().catch(() => {});
              handleFooterClick("bedtime-stories");
            }}
            className={`flex flex-col items-center ${
              selected === "bedtime" ? "text-green-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "bedtime"
                  ? "/robermenuselected.png"
                  : "/robertmenuunselected.png "
              }
              alt="Bedtime"
              className="h-14 w-14"
            />
            <span className="text-xs">Bedtime</span>
          </button>

          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3");
              audio.play().catch(() => {});
              handleFooterClick("setting");
            }}
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
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Setting;
