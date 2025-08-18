import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { 
  Play, 
  Lock, 
  Minimize2, 
  ThumbsUp, 
  MessageCircle, 
  Share2,
  Send,
  Edit3,
  Trash2
} from "lucide-react";

const EpisodesComponent = () => {
  const { user } = useUser();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [unlockedEpisodes, setUnlockedEpisodes] = useState([]);
  const [completedEpisodes, setCompletedEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingEpisode, setPlayingEpisode] = useState(null);
  const [selected, setSelected] = useState("entertainment");
  
  // YouTube-style states
  const [episodeStats, setEpisodeStats] = useState({});
  const [userLikeStatus, setUserLikeStatus] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showComments, setShowComments] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [loadingActions, setLoadingActions] = useState({});

  // Episode data - same as original
  const episodes = [
    {
      id: 1,
      title: {
        en: "Think Outside The Box",
        hi: "बॉक्स के बाहर सोचें",
      },
      description: {
        en: "Episode 1",
        hi: "श्रृंखला 1",
      },
      thumbnail: "https://d16ho1g3lqitul.cloudfront.net/EP01.png",
      videoUrl: "https://d16ho1g3lqitul.cloudfront.net/Sochu_EP001_Lineup 2.mp4",
      duration: "13:00",
      requiredUnit: 1,
      views: "3",
      // uploadDate: "2 weeks ago"
    },
    {
      id: 2,
      title: {
        en: "Creative Thinking",
        hi: "रचनात्मक सोच",
      },
      description: {
        en: "Episode 2",
        hi: "श्रृंखला 2",
      },
      thumbnail: "https://d16ho1g3lqitul.cloudfront.net/EP02.png",
      videoUrl: "https://d16ho1g3lqitul.cloudfront.net/episode2.mp4",
      duration: "6:15",
      requiredUnit: 2,
      views: "0",
      
    },
    {
      id: 3,
      title: {
        en: "Problem Solving",
        hi: "समस्या समाधान",
      },
      description: {
        en: "Learn to tackle challenges with confidence using proven problem-solving strategies.",
        hi: "आत्मविश्वास के साथ चुनौतियों का सामना करना सीखें",
      },
      thumbnail: "https://d16ho1g3lqitul.cloudfront.net/EP03.png",
      videoUrl: "https://d16ho1g3lqitul.cloudfront.net/episode3.mp4",
      duration: "7:20",
      requiredUnit: 3,
      views: "0",
      
    },
    {
      id: 4,
      title: {
        en: "Innovation",
        hi: "नवाचार",
      },
      description: {
        en: "Discover the power of innovative thinking and learn how to create amazing solutions.",
        hi: "नवाचार की शक्ति की खोज करें",
      },
      thumbnail: "https://d16ho1g3lqitul.cloudfront.net/EP04.png",
      videoUrl: "https://d16ho1g3lqitul.cloudfront.net/episode4.mp4",
      duration: "8:45",
      requiredUnit: 4,
      views: "0",
      
    },
    {
      id: 5,
      title: {
        en: "Innovation",
        hi: "नवाचार",
      },
      description: {
        en: "Discover the power of innovative thinking and learn how to create amazing solutions.",
        hi: "नवाचार की शक्ति की खोज करें",
      },
      thumbnail: "https://d16ho1g3lqitul.cloudfront.net/EP05.png",
      videoUrl: "https://d16ho1g3lqitul.cloudfront.net/episode4.mp4",
      duration: "8:45",
      requiredUnit: 5,
      views: "0",
      
    },
    {
      id: 6,
      title: {
        en: "Innovation",
        hi: "नवाचार",
      },
      description: {
        en: "Discover the power of innovative thinking and learn how to create amazing solutions.",
        hi: "नवाचार की शक्ति की खोज करें",
      },
      thumbnail: "https://d16ho1g3lqitul.cloudfront.net/EP06.png",
      videoUrl: "https://d16ho1g3lqitul.cloudfront.net/episode4.mp4",
      duration: "8:45",
      requiredUnit: 6,
      views: "0",
      
    },
    {
      id: 7,
      title: {
        en: "Innovation",
        hi: "नवाचार",
      },
      description: {
        en: "Discover the power of innovative thinking and learn how to create amazing solutions.",
        hi: "नवाचार की शक्ति की खोज करें",
      },
      thumbnail: "https://d16ho1g3lqitul.cloudfront.net/EP07.png",
      videoUrl: "https://d16ho1g3lqitul.cloudfront.net/episode4.mp4",
      duration: "8:45",
      requiredUnit: 7,
      views: "0",
      
    },
    {
      id: 8,
      title: {
        en: "Innovation",
        hi: "नवाचार",
      },
      description: {
        en: "Discover the power of innovative thinking and learn how to create amazing solutions.",
        hi: "नवाचार की शक्ति की खोज करें",
      },
      thumbnail: "https://d16ho1g3lqitul.cloudfront.net/EP08.png",
      videoUrl: "https://d16ho1g3lqitul.cloudfront.net/episode4.mp4",
      duration: "8:45",
      requiredUnit: 8,
      views: "0",
      
    },
    {
      id: 9,
      title: {
        en: "Innovation",
        hi: "नवाचार",
      },
      description: {
        en: "Discover the power of innovative thinking and learn how to create amazing solutions.",
        hi: "नवाचार की शक्ति की खोज करें",
      },
      thumbnail: "https://d16ho1g3lqitul.cloudfront.net/EP09.png",
      videoUrl: "https://d16ho1g3lqitul.cloudfront.net/episode4.mp4",
      duration: "8:45",
      requiredUnit: 9,
      views: "0",
      
    },
    {
      id: 10,
      title: {
        en: "Innovation",
        hi: "नवाचार",
      },
      description: {
        en: "Discover the power of innovative thinking and learn how to create amazing solutions.",
        hi: "नवाचार की शक्ति की खोज करें",
      },
      thumbnail: "https://d16ho1g3lqitul.cloudfront.net/EP010.png",
      videoUrl: "https://d16ho1g3lqitul.cloudfront.net/episode4.mp4",
      duration: "8:45",
      requiredUnit: 10,
      views: "0",
      
    },
    {
      id: 11,
      title: {
        en: "Innovation",
        hi: "नवाचार",
      },
      description: {
        en: "Discover the power of innovative thinking and learn how to create amazing solutions.",
        hi: "नवाचार की शक्ति की खोज करें",
      },
      thumbnail: "https://d16ho1g3lqitul.cloudfront.net/EP011.png",
      videoUrl: "https://d16ho1g3lqitul.cloudfront.net/episode4.mp4",
      duration: "8:45",
      requiredUnit: 11,
      views: "0",
      
    },
    {
      id: 12,
      title: {
        en: "Innovation",
        hi: "नवाचार",
      },
      description: {
        en: "Discover the power of innovative thinking and learn how to create amazing solutions.",
        hi: "नवाचार की शक्ति की खोज करें",
      },
      thumbnail: "https://d16ho1g3lqitul.cloudfront.net/EP012.png",
      videoUrl: "https://d16ho1g3lqitul.cloudfront.net/episode4.mp4",
      duration: "8:45",
      requiredUnit: 12,
      views: "0",
      
    },
  ];

  // Footer click handler - exact same as SeriesDetail
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

  useEffect(() => {
    if (user) {
      fetchUserEpisodeProgress();
      fetchAllEpisodeStats();
    }
  }, [user]);

  const fetchUserEpisodeProgress = async () => {
    try {
      const response = await fetch(
        `https://sochu.online/api/series/episodes/${user.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setUnlockedEpisodes(data.unlockedEpisodes || [1]);
        setCompletedEpisodes(data.completedEpisodes || []);
      }
    } catch (error) {
      console.error("Error fetching episode progress:", error);
      setUnlockedEpisodes([1]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEpisodeStats = async () => {
    try {
      // Initialize default stats for each episode
      const newEpisodeStats = {};
      const newUserLikeStatus = {};
      const newComments = {};

      for (const episode of episodes) {
        try {
          // Fetch episode stats
          const statsResponse = await fetch(`https://sochu.online/api/series/episodes/${episode.id}/stats`);
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            newEpisodeStats[episode.id] = {
              likes: statsData.stats.likes || 0,
              commentCount: statsData.stats.commentCount || 0
            };
            newComments[episode.id] = statsData.stats.comments || [];
          } else {
            // Set default values if API fails
            newEpisodeStats[episode.id] = { likes: 0, commentCount: 0 };
            newComments[episode.id] = [];
          }

          // Fetch user like status
          const statusResponse = await fetch(`https://sochu.online/api/series/episodes/${episode.id}/user-status/${user.id}`);
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            newUserLikeStatus[episode.id] = { liked: statusData.status.liked || false };
          } else {
            newUserLikeStatus[episode.id] = { liked: false };
          }
        } catch (episodeError) {
          console.error(`Error fetching stats for episode ${episode.id}:`, episodeError);
          // Set default values on error
          newEpisodeStats[episode.id] = { likes: 0, commentCount: 0 };
          newUserLikeStatus[episode.id] = { liked: false };
          newComments[episode.id] = [];
        }
      }

      setEpisodeStats(newEpisodeStats);
      setUserLikeStatus(newUserLikeStatus);
      setComments(newComments);

      console.log("Episode stats loaded:", newEpisodeStats);
      console.log("Comments loaded:", newComments);
    } catch (error) {
      console.error("Error fetching episode stats:", error);
      // Set default values for all episodes on complete failure
      const defaultStats = {};
      const defaultStatus = {};
      const defaultComments = {};
      
      episodes.forEach(episode => {
        defaultStats[episode.id] = { likes: 0, commentCount: 0 };
        defaultStatus[episode.id] = { liked: false };
        defaultComments[episode.id] = [];
      });

      setEpisodeStats(defaultStats);
      setUserLikeStatus(defaultStatus);
      setComments(defaultComments);
    }
  };

  const handleLike = async (episodeId) => {
    if (loadingActions[`like-${episodeId}`]) return;
    
    setLoadingActions(prev => ({ ...prev, [`like-${episodeId}`]: true }));
    
    try {
      const response = await fetch(
        `https://sochu.online/api/series/episodes/${episodeId}/like/${user.id}`,
        { method: 'POST' }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Update user like status
        setUserLikeStatus(prev => ({
          ...prev,
          [episodeId]: { liked: data.liked }
        }));

        // Update episode stats
        setEpisodeStats(prev => ({
          ...prev,
          [episodeId]: {
            ...prev[episodeId],
            likes: (prev[episodeId]?.likes || 0) + (data.liked ? 1 : -1)
          }
        }));

        console.log(`Episode ${episodeId} like status updated:`, data.liked);
      }
    } catch (error) {
      console.error("Error liking episode:", error);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`like-${episodeId}`]: false }));
    }
  };

  const handleComment = async (episodeId) => {
    const commentText = newComment[episodeId];
    if (!commentText || !commentText.trim() || loadingActions[`comment-${episodeId}`]) return;

    setLoadingActions(prev => ({ ...prev, [`comment-${episodeId}`]: true }));

    try {
      const response = await fetch(
        `https://sochu.online/api/series/episodes/${episodeId}/comment/${user.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: commentText.trim(),
            userName: user.firstName || user.fullName || 'Anonymous'
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        console.log("Comment added successfully:", data.comment);
        
        // Add new comment to the list (at the beginning for newest first)
        setComments(prev => ({
          ...prev,
          [episodeId]: [data.comment, ...(prev[episodeId] || [])]
        }));

        // Update comment count
        setEpisodeStats(prev => ({
          ...prev,
          [episodeId]: {
            ...prev[episodeId],
            commentCount: (prev[episodeId]?.commentCount || 0) + 1
          }
        }));

        // Clear input
        setNewComment(prev => ({ ...prev, [episodeId]: "" }));
      } else {
        console.error("Failed to add comment:", response.status);
        // Refresh comments to get latest data
        await refreshEpisodeComments(episodeId);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      // Refresh comments to get latest data
      await refreshEpisodeComments(episodeId);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`comment-${episodeId}`]: false }));
    }
  };

  // Helper function to refresh comments
  const refreshEpisodeComments = async (episodeId) => {
    try {
      const response = await fetch(`https://sochu.online/api/series/episodes/${episodeId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setComments(prev => ({
          ...prev,
          [episodeId]: data.stats.comments || []
        }));
        setEpisodeStats(prev => ({
          ...prev,
          [episodeId]: {
            ...prev[episodeId],
            commentCount: data.stats.commentCount || 0
          }
        }));
      }
    } catch (error) {
      console.error("Error refreshing comments:", error);
    }
  };

  const handleEditComment = async (episodeId, commentId) => {
    if (!editCommentText.trim() || loadingActions[`edit-${commentId}`]) return;

    setLoadingActions(prev => ({ ...prev, [`edit-${commentId}`]: true }));

    try {
      const response = await fetch(
        `https://sochu.online/api/series/episodes/${episodeId}/comment/${user.id}/${commentId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: editCommentText.trim() })
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Update comment in the list
        setComments(prev => ({
          ...prev,
          [episodeId]: prev[episodeId].map(comment => 
            comment.id === commentId ? data.comment : comment
          )
        }));

        // Reset editing state
        setEditingComment(null);
        setEditCommentText("");
      } else {
        // Refresh comments if edit failed
        await refreshEpisodeComments(episodeId);
      }
    } catch (error) {
      console.error("Error editing comment:", error);
      await refreshEpisodeComments(episodeId);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`edit-${commentId}`]: false }));
    }
  };

  const handleDeleteComment = async (episodeId, commentId) => {
    if (loadingActions[`delete-${commentId}`]) return;
    
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    setLoadingActions(prev => ({ ...prev, [`delete-${commentId}`]: true }));

    try {
      const response = await fetch(
        `https://sochu.online/api/series/episodes/${episodeId}/comment/${user.id}/${commentId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        // Remove comment from the list
        setComments(prev => ({
          ...prev,
          [episodeId]: prev[episodeId].filter(comment => comment.id !== commentId)
        }));

        // Update comment count
        setEpisodeStats(prev => ({
          ...prev,
          [episodeId]: {
            ...prev[episodeId],
            commentCount: Math.max(0, (prev[episodeId]?.commentCount || 0) - 1)
          }
        }));
      } else {
        // Refresh comments if delete failed
        await refreshEpisodeComments(episodeId);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      await refreshEpisodeComments(episodeId);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`delete-${commentId}`]: false }));
    }
  };

  const playEpisode = async (episode) => {
    try {
      if (!completedEpisodes.includes(episode.id)) {
        await fetch(
          `https://sochu.online/api/series/episodes/${user.id}/${episode.id}/complete`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );
        setCompletedEpisodes([...completedEpisodes, episode.id]);
      }
      setPlayingEpisode(episode.id);
    } catch (error) {
      console.error("Error playing episode:", error);
      setPlayingEpisode(episode.id);
    }
  };

  const stopVideo = () => {
    setPlayingEpisode(null);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const texts = {
    en: {
      episodes: "Episodes",
      locked: "Locked",
      completed: "Completed",
      play: "Play",
      watch: "Watch",
      minimize: "Minimize",
      unlockHint: "Complete Unit {unit} to unlock",
      noEpisodes: "No episodes available yet!",
      likes: "likes",
      comments: "Comments",
      addComment: "Add a comment...",
      send: "Send",
      reply: "Reply",
      share: "Share",
      views: "views",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel"
    },
    hi: {
      episodes: "एपिसोड",
      locked: "लॉक",
      completed: "पूर्ण",
      play: "प्ले",
      watch: "देखें",
      minimize: "छोटा करें",
      unlockHint: "अनलॉक करने के लिए यूनिट {unit} पूरा करें",
      noEpisodes: "अभी तक कोई एपिसोड उपलब्ध नहीं है!",
      likes: "लाइक्स",
      comments: "टिप्पणियाँ",
      addComment: "टिप्पणी जोड़ें...",
      send: "भेजें",
      reply: "जवाब",
      share: "शेयर",
      views: "व्यूज",
      edit: "संपादित करें",
      delete: "हटाएं",
      save: "सेव करें",
      cancel: "रद्द करें"
    },
  };

  const currentTexts = texts[language];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading episodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="p-4 bg-white">
        <div className="text-center mb-4">
          <div className="flex flex-col items-center justify-center mb-2">
            <img
              src="/Entertainment-Banner.png"
              alt="Entertainment"
              className="w-24 h-24 pb-3"
            />
            <h2 className="text-2xl font-bold mb-2">
              {currentTexts.episodes}
            </h2>
            <p className="text-sm text-gray-500">
              Watch episodes as you complete units!
            </p>
          </div>
          <hr className="border-gray-300 my-2" />
        </div>

        {/* Episodes Content */}
        {episodes.length === 0 ? (
          <p className="text-center text-gray-500">
            {currentTexts.noEpisodes}
          </p>
        ) : (
          <div className="space-y-6">
            {episodes.map((episode) => {
              const isUnlocked = unlockedEpisodes.includes(episode.id);
              const isCompleted = completedEpisodes.includes(episode.id);
              const isPlaying = playingEpisode === episode.id;
              const stats = episodeStats[episode.id] || { likes: 0, commentCount: 0 };
              const userStatus = userLikeStatus[episode.id] || { liked: false };
              const episodeComments = comments[episode.id] || [];

              return (
                <div key={episode.id}>
                  {/* YouTube-Style Episode Card */}
                  {!isPlaying && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                      {/* Large Thumbnail */}
                      <div className="relative aspect-video">
                        <img
                          src={episode.thumbnail}
                          alt={episode.title[language]}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://d16ho1g3lqitul.cloudfront.net/default-episode-thumb.jpg";
                          }}
                        />
                        
                        {/* Play/Lock Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center">
                          {isUnlocked ? (
                            <button
                              onClick={() => playEpisode(episode)}
                              className="w-16 h-16 bg-gray-600/50 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
                            >
                              <Play className="w-8 h-8 text-white ml-1" />
                            </button>
                          ) : (
                            <div className="w-16 h-16 bg-gray-600/50 rounded-full flex items-center justify-center">
                              <Lock className="w-8 h-8 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Duration Badge */}
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-sm font-medium">
                          {episode.duration}
                        </div>

                        {/* Completed Badge */}
                        {/* {isCompleted && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                            <span className="text-sm font-bold">✓</span>
                          </div>
                        )} */}
                      </div>

                      {/* Video Info */}
                      <div className="p-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                          {episode.title[language]}
                        </h3>
                        
                        {/* Video Stats */}
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <span>{episode.views} {currentTexts.views}</span>
                          <span className="mx-2">•</span>
                          <span>{episode.uploadDate}</span>
                        </div>

                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                          {episode.description[language]}
                        </p>

                        {/* Action Buttons - Removed Dislike */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {/* Like Button */}
                            <button
                              onClick={() => handleLike(episode.id)}
                              disabled={!isUnlocked || loadingActions[`like-${episode.id}`]}
                              className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors ${
                                userStatus.liked
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              } ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : ''} ${
                                loadingActions[`like-${episode.id}`] ? 'opacity-50' : ''
                              }`}
                            >
                              <ThumbsUp className="w-4 h-4" />
                              <span className="text-sm font-medium">{stats.likes}</span>
                            </button>

                            {/* Comment Button */}
                            <button
                              onClick={() => setShowComments(prev => ({ ...prev, [episode.id]: !prev[episode.id] }))}
                              disabled={!isUnlocked}
                              className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200 ${
                                !isUnlocked ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">{stats.commentCount}</span>
                            </button>

                            {/* Share Button */}
                            {/* <button className="flex items-center space-x-2 px-3 py-2 rounded-full transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200">
                              <Share2 className="w-4 h-4" />
                              <span className="text-sm font-medium">{currentTexts.share}</span>
                            </button> */}
                          </div>

                          {/* Status */}
                          <div>
                            {!isUnlocked && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                {currentTexts.unlockHint.replace("{unit}", episode.requiredUnit)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Comments Section */}
                        {showComments[episode.id] && isUnlocked && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            {/* Add Comment */}
                            <div className="flex items-start space-x-3 mb-4">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {user?.firstName?.[0] || '👤'}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    placeholder={currentTexts.addComment}
                                    value={newComment[episode.id] || ''}
                                    onChange={(e) => setNewComment(prev => ({ ...prev, [episode.id]: e.target.value }))}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    onKeyPress={(e) => e.key === 'Enter' && handleComment(episode.id)}
                                    disabled={loadingActions[`comment-${episode.id}`]}
                                  />
                                  <button
                                    onClick={() => handleComment(episode.id)}
                                    disabled={loadingActions[`comment-${episode.id}`] || !newComment[episode.id]?.trim()}
                                    className={`px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                      loadingActions[`comment-${episode.id}`] ? 'animate-pulse' : ''
                                    }`}
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Comments List */}
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                              {episodeComments.map((comment) => (
                                <div key={comment.id} className="flex items-start space-x-3">
                                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm">
                                    {comment.avatar || '👤'}
                                  </div>
                                  <div className="flex-1">
                                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="font-medium text-sm text-gray-900">{comment.userName}</span>
                                          <span className="text-xs text-gray-500">{formatTimeAgo(comment.timestamp)}</span>
                                          {comment.editedAt && (
                                            <span className="text-xs text-gray-400">(edited)</span>
                                          )}
                                        </div>
                                        {comment.userId === user.id && (
                                          <div className="flex items-center space-x-1">
                                            <button
                                              onClick={() => {
                                                setEditingComment(comment.id);
                                                setEditCommentText(comment.text);
                                              }}
                                              className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                              disabled={loadingActions[`edit-${comment.id}`]}
                                            >
                                              <Edit3 className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteComment(episode.id, comment.id)}
                                              className="p-1 text-gray-400 hover:text-red-600 rounded"
                                              disabled={loadingActions[`delete-${comment.id}`]}
                                            >
                                              {loadingActions[`delete-${comment.id}`] ? (
                                                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                              ) : (
                                                <Trash2 className="w-3 h-3" />
                                              )}
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {editingComment === comment.id ? (
                                        <div className="flex items-center space-x-2 mt-2">
                                          <input
                                            type="text"
                                            value={editCommentText}
                                            onChange={(e) => setEditCommentText(e.target.value)}
                                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            onKeyPress={(e) => {
                                              if (e.key === 'Enter') handleEditComment(episode.id, comment.id);
                                              if (e.key === 'Escape') {
                                                setEditingComment(null);
                                                setEditCommentText("");
                                              }
                                            }}
                                          />
                                          <button
                                            onClick={() => handleEditComment(episode.id, comment.id)}
                                            disabled={loadingActions[`edit-${comment.id}`] || !editCommentText.trim()}
                                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                                          >
                                            {loadingActions[`edit-${comment.id}`] ? (
                                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                              currentTexts.save
                                            )}
                                          </button>
                                          <button
                                            onClick={() => {
                                              setEditingComment(null);
                                              setEditCommentText("");
                                            }}
                                            className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                                          >
                                            {currentTexts.cancel}
                                          </button>
                                        </div>
                                      ) : (
                                        <p className="text-sm text-gray-700">{comment.text}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              {episodeComments.length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-4">
                                  No comments yet. Be the first to comment!
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Full Video Player when playing */}
                  {isPlaying && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                      <div className="relative">
                        <div className="relative" style={{ paddingBottom: "56.25%" }}>
                          <video
                            src={episode.videoUrl}
                            controls
                            autoPlay
                            className="absolute top-0 left-0 w-full h-full"
                            poster={episode.thumbnail}
                            controlsList="nodownload"
                            onContextMenu={(e) => e.preventDefault()}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>

                        {/* Minimize Button */}
                        <button
                          onClick={stopVideo}
                          className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                        >
                          <Minimize2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Video Info */}
                      <div className="p-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {episode.title[language]}
                        </h3>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <span>{episode.views} {currentTexts.views}</span>
                          <span className="mx-2">•</span>
                          <span>{episode.uploadDate}</span>
                        </div>

                        <p className="text-sm text-gray-700 mb-4">
                          {episode.description[language]}
                        </p>

                        {/* Action Buttons for Playing Video - Removed Dislike */}
                        <div className="flex items-center space-x-4 mb-4">
                          <button
                            onClick={() => handleLike(episode.id)}
                            disabled={loadingActions[`like-${episode.id}`]}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                              userStatus.liked
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            } ${loadingActions[`like-${episode.id}`] ? 'opacity-50' : ''}`}
                          >
                            <ThumbsUp className="w-5 h-5" />
                            <span className="font-medium">{stats.likes}</span>
                          </button>

                          <button
                            onClick={() => setShowComments(prev => ({ ...prev, [episode.id]: !prev[episode.id] }))}
                            className="flex items-center space-x-2 px-4 py-2 rounded-full transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200"
                          >
                            <MessageCircle className="w-5 h-5" />
                            <span className="font-medium">{currentTexts.comments}</span>
                          </button>

                          <button className="flex items-center space-x-2 px-4 py-2 rounded-full transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200">
                            <Share2 className="w-5 h-5" />
                            <span className="font-medium">{currentTexts.share}</span>
                          </button>
                        </div>

                        {/* Comments Section for Playing Video */}
                        {showComments[episode.id] && (
                          <div className="pt-4 border-t border-gray-200">
                            {/* Add Comment */}
                            <div className="flex items-start space-x-3 mb-4">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {user?.firstName?.[0] || '👤'}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    placeholder={currentTexts.addComment}
                                    value={newComment[episode.id] || ''}
                                    onChange={(e) => setNewComment(prev => ({ ...prev, [episode.id]: e.target.value }))}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    onKeyPress={(e) => e.key === 'Enter' && handleComment(episode.id)}
                                    disabled={loadingActions[`comment-${episode.id}`]}
                                  />
                                  <button
                                    onClick={() => handleComment(episode.id)}
                                    disabled={loadingActions[`comment-${episode.id}`] || !newComment[episode.id]?.trim()}
                                    className={`px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                      loadingActions[`comment-${episode.id}`] ? 'animate-pulse' : ''
                                    }`}
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Comments List for Playing Video */}
                            <div className="space-y-3 max-h-48 overflow-y-auto">
                              {episodeComments.map((comment) => (
                                <div key={comment.id} className="flex items-start space-x-3">
                                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm">
                                    {comment.avatar || '👤'}
                                  </div>
                                  <div className="flex-1">
                                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="font-medium text-sm text-gray-900">{comment.userName}</span>
                                          <span className="text-xs text-gray-500">{formatTimeAgo(comment.timestamp)}</span>
                                          {comment.editedAt && (
                                            <span className="text-xs text-gray-400">(edited)</span>
                                          )}
                                        </div>
                                        {comment.userId === user.id && (
                                          <div className="flex items-center space-x-1">
                                            <button
                                              onClick={() => {
                                                setEditingComment(comment.id);
                                                setEditCommentText(comment.text);
                                              }}
                                              className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                              disabled={loadingActions[`edit-${comment.id}`]}
                                            >
                                              <Edit3 className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteComment(episode.id, comment.id)}
                                              className="p-1 text-gray-400 hover:text-red-600 rounded"
                                              disabled={loadingActions[`delete-${comment.id}`]}
                                            >
                                              {loadingActions[`delete-${comment.id}`] ? (
                                                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                              ) : (
                                                <Trash2 className="w-3 h-3" />
                                              )}
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {editingComment === comment.id ? (
                                        <div className="flex items-center space-x-2 mt-2">
                                          <input
                                            type="text"
                                            value={editCommentText}
                                            onChange={(e) => setEditCommentText(e.target.value)}
                                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            onKeyPress={(e) => {
                                              if (e.key === 'Enter') handleEditComment(episode.id, comment.id);
                                              if (e.key === 'Escape') {
                                                setEditingComment(null);
                                                setEditCommentText("");
                                              }
                                            }}
                                          />
                                          <button
                                            onClick={() => handleEditComment(episode.id, comment.id)}
                                            disabled={loadingActions[`edit-${comment.id}`] || !editCommentText.trim()}
                                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                                          >
                                            {loadingActions[`edit-${comment.id}`] ? (
                                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                              currentTexts.save
                                            )}
                                          </button>
                                          <button
                                            onClick={() => {
                                              setEditingComment(null);
                                              setEditCommentText("");
                                            }}
                                            className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                                          >
                                            {currentTexts.cancel}
                                          </button>
                                        </div>
                                      ) : (
                                        <p className="text-sm text-gray-700">{comment.text}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              {episodeComments.length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-4">
                                  No comments yet. Be the first to comment!
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer - Exact same as before */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white shadow-md p-2 pt-3 z-50"
        style={{ boxShadow: "0 -1px 4px rgba(0, 0, 0, 0.05)" }}
      >
        <div className="flex justify-around items-center text-gray-600 pb-3">
          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3");
              audio.play().catch(() => {});
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
              audio.play().catch(() => {});
              handleFooterClick("bedtime");
            }}
            className={`flex flex-col items-center ${
              selected === "bedtime" ? "text-green-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "bedtime"
                  ? "/robermenuselected.png "
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
              audio.play().catch(() => {});
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
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EpisodesComponent;