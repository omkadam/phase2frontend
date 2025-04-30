import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";

const BroadcastList = () => {
  const { user } = useUser();
  const [broadcasts, setBroadcasts] = useState([]);
  const [subscribed, setSubscribed] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null); // ✅ Track clicked channel
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
        // check here i think need to replace pause-with-5-breaths with {slug}
        const res = await fetch(`http://localhost:3001/api/series/pause-with-5-breaths/progress/${user.id}`);
        const data = await res.json();
        setSubscribed(data.broadcastSubscriptions ?? []);
      } catch (err) {
        console.error("Failed to fetch user progress", err);
      }
    };

    if (user) {
      fetchBroadcasts();
      fetchUserProgress();
      setLoading(false);
    }
  }, [user]);

  const subscribe = async (slug) => {
    try {
      await fetch(`http://localhost:3001/api/broadcasts/${slug}/subscribe/${user.id}`, {
        method: "POST",
      });
      setSubscribed((prev) => [...prev, slug]);
    } catch (err) {
      alert("Error subscribing to channel");
    }
  };

  const fetchPosts = async (slug, name) => {
    try {
      const res = await fetch(`http://localhost:3001/api/broadcasts/${slug}/posts`);
      const data = await res.json();
      setSelectedChannel({ name, slug });
      setPosts(data);
    } catch (err) {
      console.error("Failed to load posts", err);
    }
  };

  const goBack = () => {
    setSelectedChannel(null);
    setPosts([]);
  };

  if (loading) return <div className="p-4 text-center">Loading channels...</div>;

  // ✅ If channel selected, show posts
  if (selectedChannel) {
    return (
      <div className="p-4 max-h-[75vh] overflow-y-auto">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{selectedChannel.name}</h2>
          <button onClick={goBack} className="text-sm text-blue-600 underline">← Back to Channels</button>
        </div>
        {posts.length === 0 ? (
          <p className="text-gray-500">No posts yet in this channel.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="border rounded p-3 shadow bg-gray-50">
                <div className="font-bold text-lg">{post.title}</div>
                <div className="text-gray-700">{post.content}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(post.date).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ✅ Show list of channels
  return (
    <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-2">📡 Broadcast Channels</h2>
      {broadcasts.map((b) => (
        <div
          key={b.slug}
          className="bg-white rounded-xl shadow p-4 cursor-pointer hover:bg-gray-50 transition"
          onClick={() => fetchPosts(b.slug, b.name)}
        >
          <div className="font-bold text-lg">{b.name}</div>
          <div className="text-sm text-gray-600">{b.description}</div>
          {subscribed.includes(b.slug) ? (
            <span className="text-green-600 text-sm font-bold">✓ Subscribed</span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation(); // stop post modal open
                subscribe(b.slug);
              }}
              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
            >
              Subscribe
            </button>
          )}
        </div>
      ))}
      {broadcasts.length === 0 && (
        <div className="text-sm text-gray-500 text-center mt-8">No channels found.</div>
      )}
    </div>
  );
};

export default BroadcastList;
