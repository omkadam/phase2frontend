import React, { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { CircleArrowLeft } from "lucide-react";

const BroadcastList = () => {
  const { user } = useUser();
  const [broadcasts, setBroadcasts] = useState([]);
  const [subscribed, setSubscribed] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("broadcasts");
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [commentingOnPost, setCommentingOnPost] = useState(null);
  const [carouselIndexes, setCarouselIndexes] = useState({});
  const carouselRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBroadcasts = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/broadcasts");
        const data = await res.json();
        setBroadcasts(data);
      } catch (err) {
        console.error("Failed to fetch broadcasts", err);
      }
    };

    const fetchUserProgress = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/series/pause-with-5-breaths/progress/${user.id}`
        );
        const data = await res.json();
        setSubscribed(data.broadcastSubscriptions ?? []);
      } catch (err) {
        console.error("Failed to fetch user progress", err);
      }
    };

    if (user) {
      Promise.all([fetchBroadcasts(), fetchUserProgress()]).then(() => {
        setLoading(false); // ✅ set after both fetches are done
      });
    }
  }, [user]);

  const subscribe = async (slug, e) => {
    e.stopPropagation();
    try {
      await fetch(
        `http://localhost:3001/api/broadcasts/${slug}/subscribe/${user.id}`,
        {
          method: "POST",
        }
      );
      setSubscribed((prev) => [...prev, slug]);
    } catch (err) {
      alert("Error subscribing to channel");
    }
  };

  const fetchPosts = async (slug, name) => {
    try {
      const broadcast = broadcasts.find((b) => b.slug === slug);

      if (broadcast && broadcast.posts && broadcast.posts.length > 0) {
        setSelectedChannel({ name, slug });
        setPosts(broadcast.posts);
      } else {
        const res = await fetch(
          `http://localhost:3001/api/broadcasts/${slug}/posts`
        );
        const data = await res.json();
        setSelectedChannel({ name, slug });
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to load posts", err);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/broadcasts/${selectedChannel.slug}/posts/${postId}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            username: user.username || user.firstName || "Anonymous",
          }),
        }
      );

      if (res.ok) {
        const updatedPost = await res.json();
        // Update the posts state with the new like data
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId ? { ...post, likes: updatedPost.likes } : post
          )
        );
      }
    } catch (err) {
      console.error("Failed to like post", err);
    }
  };

  const handleComment = async (postId) => {
    if (!newComment.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:3001/api/broadcasts/${selectedChannel.slug}/posts/${postId}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            username: user.username || user.firstName || "Anonymous",
            content: newComment.trim(),
          }),
        }
      );

      if (res.ok) {
        const updatedPost = await res.json();
        // Update the posts state with the new comment
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? { ...post, comments: updatedPost.comments }
              : post
          )
        );
        setNewComment("");
        setCommentingOnPost(null);
      }
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  const toggleComments = (postId) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const isLikedByUser = (likes) => {
    return likes && likes.some((like) => like.userId === user.id);
  };

  const goBack = () => {
    setSelectedChannel(null);
    setPosts([]);
    setShowComments({});
    setCommentingOnPost(null);
    setNewComment("");
  };

  const handleFooterClick = (page) => {
    setSelected(page);
    navigate(`/${page}`);
  };

  const handleScroll = (e, postId, totalImages) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.offsetWidth;

    const index = Math.round(scrollLeft / width);

    setCarouselIndexes((prev) => ({
      ...prev,
      [postId]: Math.min(Math.max(index, 0), totalImages - 1),
    }));
  };
  //loading

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <img
          src="https://d16ho1g3lqitul.cloudfront.net/sochuloading.gif" // ✅ Replace this with your actual loading gif URL
          alt="Loading..."
          className="w-48 h-48"
        />
      </div>
    );
  }

  // ✅ If channel selected, show posts
  if (selectedChannel) {
    return (
      <div className="p-4 overflow-y-auto">
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3");
              audio.play();
              goBack();
            }}
            className="text-lg"
          >
            <CircleArrowLeft className="text-gray-400" />
          </button>

          <h2 className="text-xl font-bold text-center flex-1">
            🪴{selectedChannel.name}
          </h2>
          <div className="w-8"></div>
        </div>
        {posts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p>No posts yet in this channel.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-20">
            {posts.map((post, index) => (
              <div
                key={post._id || index}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Post Header */}
                <div className="flex items-center p-4 border-b border-gray-50">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    {/* <span className="text-white font-bold text-lg">
                      {selectedChannel.name[0]}
                    </span> */}
                    {/* <img src="https://d16ho1g3lqitul.cloudfront.net/sochuloading.gif" /> */}
                    <img src={post.profilePicture} />
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-sm">
                      {selectedChannel.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  {/* Display Images Above Title and Content */}
                  {(post.images?.length > 0 || post.videos?.length > 0) && (
                    <div className="mb-3 relative">
                      {/* Mixed media carousel */}
                      <div
                        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-lg"
                        style={{
                          scrollSnapType: "x mandatory",
                          scrollBehavior: "smooth",
                        }}
                        ref={(ref) => (carouselRefs.current[post._id] = ref)}
                        onScroll={(e) =>
                          handleScroll(
                            e,
                            post._id,
                            (post.images?.length || 0) +
                              (post.videos?.length || 0)
                          )
                        }
                      >
                        {/* Show images */}
                        {post.images?.map((image, idx) => (
                          <div
                            key={`img-${idx}`}
                            className="w-full aspect-[4/5] flex-shrink-0 snap-center flex items-center justify-center bg-black rounded-lg overflow-hidden"
                          >
                            <img
                              src={image}
                              alt={`Post Image ${idx + 1}`}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        ))}

                        {/* Show videos */}
                        {post.videos?.map((video, idx) => (
                          <div
                            key={`vid-${idx}`}
                            className="w-full aspect-[9/16] flex-shrink-0 snap-center flex items-center justify-center bg-black rounded-lg overflow-hidden"
                          >
                            <video
                              controls
                              className="w-full h-full object-contain"
                              preload="metadata"
                              poster="/videoplaceholder.jpg"
                            >
                              <source src={video} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        ))}
                      </div>

                      {/* Dot Indicators */}
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1 z-10">
                        {[...(post.images || []), ...(post.videos || [])].map(
                          (_, idx) => (
                            <div
                              key={idx}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                carouselIndexes[post._id] === idx
                                  ? "bg-white"
                                  : "bg-white bg-opacity-50"
                              }`}
                            ></div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {/* Post Footer - Likes and Comments */}
                <div className="px-4 pb-4">
                  <div className="flex items-center space-x-6 text-gray-500">
                    <button
                      onClick={() => {
                        const audio = new Audio("/sounds/click.mp3");
                        audio.play();
                        handleLike(post._id);
                      }}
                      className={`flex items-center space-x-1 ${
                        isLikedByUser(post.likes)
                          ? "text-red-500"
                          : "text-gray-500"
                      } hover:text-red-500 transition-colors`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill={
                          isLikedByUser(post.likes) ? "currentColor" : "none"
                        }
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span className="text-sm">
                        {post.likes?.length || 0} Like
                        {post.likes?.length !== 1 ? "s" : ""}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        const audio = new Audio("/sounds/click.mp3");
                        audio.play();
                        toggleComments(post._id);
                      }}
                      className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span className="text-sm">
                        {post.comments?.length || 0} Comment
                        {post.comments?.length !== 1 ? "s" : ""}
                      </span>
                    </button>

                    {/* <button className="flex items-center space-x-1 ml-auto hover:text-blue-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                      <span className="text-sm">Save</span>
                    </button> */}
                  </div>

                  {/* Comment Input */}
                  {commentingOnPost === post._id && (
                    <div className="mt-4">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleComment(post._id);
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            const audio = new Audio("/sounds/click.mp3");
                            audio.play();
                            handleComment(post._id);
                          }}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                        >
                          Post
                        </button>

                        <button
                          onClick={() => {
                            const audio = new Audio("/sounds/click.mp3");
                            audio.play();
                            setCommentingOnPost(null);
                            setNewComment("");
                          }}
                          className="px-4 py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Add Comment Button */}
                  {commentingOnPost !== post._id && (
                    <button
                      onClick={() => {
                        const audio = new Audio("/sounds/click.mp3");
                        audio.play();
                        setCommentingOnPost(post._id);
                      }}
                      className="mt-2 text-sm text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      Add a comment...
                    </button>
                  )}

                  {/* Comments Section */}
                  {showComments[post._id] &&
                    post.comments &&
                    post.comments.length > 0 && (
                      <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
                        {post.comments.map((comment, commentIndex) => (
                          <div
                            key={comment._id || commentIndex}
                            className="flex space-x-3"
                          >
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-xs">
                                {comment.username[0].toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-semibold text-sm">
                                  {comment.username}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-xl font-bold text-center">Broadcasts</h1>
      </div>

      {/* Grid of Broadcasts */}
      <div className="p-4 pb-24">
        {broadcasts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-4xl mb-2">📡</div>
            <p>No channels found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {broadcasts.map((b) => (
              <div
                key={b.slug}
                className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer transform transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                onClick={() => fetchPosts(b.slug, b.name)}
              >
                {/* Channel Image/Placeholder */}
                <div className="relative h-40 bg-white flex items-center justify-center">
                  <div className="text-white text-6xl font-bold ">
                    <img src={b.channelIcon}/>
                  </div>

                  {/* Subscription Badge */}
                  {subscribed.includes(b.slug) && (
                    <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Posts Count */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                    {b.posts?.length || 5} posts
                  </div>
                </div>

                {/* Channel Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 truncate">{b.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {b.description}
                  </p>

                  {!subscribed.includes(b.slug) && (
                    <button
                      onClick={(e) => {
                        // Play sound
                        const audio = new Audio("/sounds/click.mp3");
                        audio.play();

                        // Trigger the subscribe logic
                        subscribe(b.slug, e);
                      }}
                      className="w-full bg-yellow-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-yellow-600 transition-all duration-150 border-b-4 border-yellow-700 active:translate-y-1 active:border-b-0"
                    >
                      Subscribe
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md p-2 pt-6 z-50" style={{ boxShadow: '0 -1px 4px rgba(0, 0, 0, 0.05)' }}>
        <div className="flex justify-around items-center text-gray-600">
          <button
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3"); // Ensure the path is correct
              audio.play();
              handleFooterClick("learn");
            }}
            className={`flex flex-col items-center ${
              selected === "Entertainment" ? "text-blue-600" : "text-gray-600"
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
            onClick={() => {
              const audio = new Audio("/sounds/click.mp3"); // Ensure the path is correct
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
              const audio = new Audio("/sounds/click.mp3"); // Ensure the path is correct
              audio.play();
              handleFooterClick("episodes");
            }}
            className={`flex flex-col items-center ${
              selected === "Entertainment" ? "text-green-600" : "text-gray-600"
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
              const audio = new Audio("/sounds/click.mp3"); // Ensure the path is correct
              audio.play();
              handleFooterClick("setting");
            }}
            className={`flex flex-col items-center ${
              selected === "learn" ? "text-pink-600" : "text-gray-600"
            } transition-colors`}
          >
            <img
              src={
                selected === "setting"
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
    </div>
  );
};

export default BroadcastList;
