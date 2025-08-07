import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

const PlanningsPage = () => {
  const { user } = useUser();
  const [newIdea, setNewIdea] = useState("");
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Fetch ideas on component mount
  useEffect(() => {
    if (user) {
      fetchIdeas();
    }
  }, [user]);

  const fetchIdeas = async () => {
    try {
      const response = await fetch(`https://sochu.online/api/series/ideas/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setIdeas(data.ideas || []);
      }
    } catch (error) {
      console.error("Error fetching ideas:", error);
    } finally {
      setLoading(false);
    }
  };

  const addIdea = async () => {
    if (!newIdea.trim()) return;

    setAdding(true);
    try {
      const ideaData = {
        text: newIdea.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      };

      const response = await fetch(`https://sochu.online/api/series/ideas/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ideaData),
      });

      if (response.ok) {
        const savedIdea = await response.json();
        setIdeas([savedIdea, ...ideas]);
        setNewIdea("");
        
        // Play success sound
        try {
          const audio = new Audio("/sounds/success.mp3");
          audio.play().catch(err => console.warn("Success sound failed:", err));
        } catch (err) {
          console.warn("Success sound not available:", err);
        }
      }
    } catch (error) {
      console.error("Error adding idea:", error);
    } finally {
      setAdding(false);
    }
  };

  const toggleIdea = async (ideaId, completed) => {
    try {
      const response = await fetch(`https://sochu.online/api/series/ideas/${user.id}/${ideaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });

      if (response.ok) {
        setIdeas(ideas.map(idea => 
          idea._id === ideaId ? { ...idea, completed: !completed } : idea
        ));
        
        // Play click sound
        try {
          const audio = new Audio("/sounds/click.mp3");
          audio.play().catch(err => console.warn("Click sound failed:", err));
        } catch (err) {
          console.warn("Click sound not available:", err);
        }
      }
    } catch (error) {
      console.error("Error updating idea:", error);
    }
  };

  const deleteIdea = async (ideaId) => {
    try {
      const response = await fetch(`https://sochu.online/api/series/ideas/${user.id}/${ideaId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setIdeas(ideas.filter(idea => idea._id !== ideaId));
      }
    } catch (error) {
      console.error("Error deleting idea:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const completedCount = ideas.filter(idea => idea.completed).length;
  const pendingCount = ideas.length - completedCount;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your ideas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <span className="text-6xl">💡</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Ideas & Planning
          </h1>
          <p className="text-gray-600 text-lg">
            Ideas Yaha Likho.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600">{ideas.length}</div>
            <div className="text-sm text-gray-600">Total Ideas</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
            <div className="text-2xl sm:text-3xl font-bold text-orange-600">{pendingCount}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100 col-span-2 sm:col-span-1">
            <div className="text-2xl sm:text-3xl font-bold text-green-600">{completedCount}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>

        {/* Add New Idea Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-purple-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">✨</span>
            Add New Idea
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              placeholder="What's your brilliant idea? Describe it here..."
              className="flex-1 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows="3"
            />
            <button
              onClick={addIdea}
              disabled={!newIdea.trim() || adding}
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:min-w-[120px]"
            >
              {adding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <span>+</span>
                  Add Idea
                </>
              )}
            </button>
          </div>
        </div>

        {/* Ideas List */}
        <div className="space-y-4">
          {ideas.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">🌟</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No ideas yet!</h3>
              <p className="text-gray-500">Start by adding your first brilliant idea above.</p>
            </div>
          ) : (
            ideas.map((idea) => (
              <div
                key={idea._id}
                className={`bg-white rounded-xl shadow-sm p-5 border transition-all duration-200 hover:shadow-md ${
                  idea.completed 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleIdea(idea._id, idea.completed)}
                    className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      idea.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-purple-500'
                    }`}
                  >
                    {idea.completed && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1">
                    <p className={`text-gray-800 mb-2 leading-relaxed ${
                      idea.completed ? 'line-through text-gray-500' : ''
                    }`}>
                      {idea.text}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {formatDate(idea.createdAt)}
                      </span>
                      
                      {/* Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        idea.completed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {idea.completed ? '✅ Completed' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteIdea(idea._id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Delete idea"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanningsPage;