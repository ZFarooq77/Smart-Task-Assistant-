import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import TaskForm from "../Tasks/TaskForm";
import TaskList from "../Tasks/TaskList";
import { taskAPI, supabase } from "../../api/supabaseClient";
import GradientLogo from "../UI/GradientLogo";

export default function Dashboard() {
  const { user, session } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTasksExpanded, setIsTasksExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState("created_at"); // created_at, category, tags, status

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch user's existing tasks
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError("");
        console.log("🔍 Fetching tasks for user:", user.id);
        const userTasks = await taskAPI.fetchUserTasks(user.id);
        console.log("🔍 Raw tasks from database:", userTasks);
        console.log("🔍 Total tasks fetched:", userTasks?.length || 0);
        setTasks(userTasks);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setError("Failed to load tasks. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user?.id]);

  // Handle new task added
  const handleTaskAdded = (newTask) => {
    setTasks([newTask, ...tasks]);
  };

  // Handle task status update
  const handleTaskStatusUpdate = async (taskId, isDone) => {
    try {
      await taskAPI.updateTaskStatus(taskId, isDone);
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, is_done: isDone } : task
      ));
    } catch (err) {
      console.error("Failed to update task:", err);
      setError("Failed to update task. Please try again.");
    }
  };

  // Handle task tags update
  const handleTaskTagsUpdate = async (taskId, newTags) => {
    try {
      await taskAPI.updateTaskTags(taskId, newTags);
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, tags: newTags } : task
      ));
    } catch (err) {
      console.error("Failed to update task tags:", err);
      setError("Failed to update task tags. Please try again.");
    }
  };

  // Handle task schedule update
  const handleTaskScheduleUpdate = async (taskId, startDate, endDate) => {
    try {
      await taskAPI.updateTaskSchedule(taskId, startDate, endDate);
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, start_date: startDate, end_date: endDate } : task
      ));
    } catch (err) {
      console.error("Failed to update task schedule:", err);
      setError("Failed to update task schedule. Please try again.");
    }
  };

  // Handle refresh tasks
  const handleRefreshTasks = async () => {
    if (!user?.id || refreshing) return;

    try {
      setRefreshing(true);
      setError("");
      const userTasks = await taskAPI.fetchUserTasks(user.id);
      setTasks(userTasks);
    } catch (err) {
      console.error("Failed to refresh tasks:", err);
      setError("Failed to refresh tasks. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.is_done).length;
  const pendingTasks = tasks.filter(task => !task.is_done).length;

  // Get all unique tags from tasks
  const allTags = [...new Set(tasks.flatMap(task => task.tags || []))].sort();

  // Filter and sort tasks
  const getFilteredAndSortedTasks = () => {
    let filtered = tasks.filter(task => {
      // Search query filter
      const matchesSearch = !searchQuery || searchQuery.trim() === '' ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.category && task.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.summary && task.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.tags && Array.isArray(task.tags) && task.tags.some(tag => tag && tag.toLowerCase().includes(searchQuery.toLowerCase())));

      // Tag filter
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.some(selectedTag => (task.tags || []).includes(selectedTag));

      return matchesSearch && matchesTags;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "category":
          return (a.category || "").localeCompare(b.category || "");
        case "status":
          return a.is_done === b.is_done ? 0 : a.is_done ? 1 : -1;
        case "created_at":
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return filtered;
  };

  const filteredTasks = getFilteredAndSortedTasks();

  // Debug filtering
  console.log("🔍 All tasks:", tasks.length);
  console.log("🔍 Filtered tasks:", filteredTasks.length);
  console.log("🔍 Search query:", searchQuery);
  console.log("🔍 Selected tags:", selectedTags);
  console.log("🔍 Sort by:", sortBy);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <GradientLogo size="md" />
              <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Navigation Links */}
              <button
                onClick={() => navigate("/schedule")}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Schedule</span>
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-xs">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    if (loggingOut) return;
                    try {
                      setLoggingOut(true);
                      await supabase.auth.signOut();
                      navigate("/login");
                    } catch (err) {
                      console.error("Logout failed:", err);
                      setLoggingOut(false);
                    }
                  }}
                  disabled={loggingOut}
                  className={`btn btn-danger btn-sm flex items-center space-x-2 ${
                    loggingOut ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {loggingOut && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{loggingOut ? "Logging out..." : "Logout"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8 animate-fadeIn">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
                <p className="text-blue-100 text-lg">Ready to tackle your tasks today?</p>
              </div>
              <div className="hidden sm:block">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">⚡</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl animate-fadeIn shadow-sm">
              <div className="flex items-center">
                <span className="mr-3 text-red-600 font-bold">✕</span>
                {error}
              </div>
            </div>
          )}

          {/* Task Form */}
          <div className="card shadow-lg">
            <div className="card-header bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center space-x-3">
                <span className="text-blue-600 font-bold text-lg">+</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Add New Task</h2>
                  <p className="text-sm text-gray-600">Describe what you need to accomplish</p>
                </div>
              </div>
            </div>
            <div className="card-body">
              <TaskForm
                token={session?.access_token}
                userId={user?.id}
                onTaskAdded={handleTaskAdded}
              />
            </div>
          </div>

          {/* Task List */}
          <div className="card shadow-lg">
            <div className="card-header bg-gradient-to-r from-gray-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-purple-600 font-bold text-lg">📋</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Your Tasks</h2>
                    <p className="text-sm text-gray-600">Manage and track your progress</p>
                  </div>
                </div>
                <button
                  onClick={handleRefreshTasks}
                  disabled={refreshing}
                  className={`btn btn-secondary btn-sm flex items-center space-x-2 transition-colors ${
                    refreshing
                      ? 'opacity-75 cursor-not-allowed'
                      : 'hover:bg-gray-200'
                  }`}
                  title={refreshing ? "Refreshing..." : "Refresh tasks"}
                >
                  {refreshing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  ) : (
                    <span className="text-sm">🔄</span>
                  )}
                  <span className="hidden sm:inline">
                    {refreshing ? "Refreshing..." : "Refresh"}
                  </span>
                </button>
              </div>
            </div>

            {/* Task Stats */}
            <div className="px-6 py-4 border-b border-gray-100 relative">
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
                  <div className="text-xs text-gray-500 font-medium">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{pendingTasks}</div>
                  <div className="text-xs text-gray-500 font-medium">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                  <div className="text-xs text-gray-500 font-medium">Done</div>
                </div>
              </div>

              {/* Toggle Button */}
              <button
                onClick={() => setIsTasksExpanded(!isTasksExpanded)}
                className="absolute bottom-2 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-full"
                title={isTasksExpanded ? "Collapse tasks" : "Expand tasks"}
              >
                <i className={`fi fi-rs-angle-small-down text-lg transition-transform duration-300 ${
                  isTasksExpanded ? 'rotate-180' : 'rotate-0'
                }`}></i>
              </button>
            </div>

            {/* Collapsible Task List */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isTasksExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
              {/* Search Bar */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <p className="mt-2 text-sm text-gray-600">
                    Found {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} matching "{searchQuery}"
                  </p>
                )}

                {/* Filtering and Sorting Controls */}
                <div className="mt-4 space-y-3">
                  {/* Sort Controls */}
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Sort by:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="created_at">Date Created</option>
                      <option value="category">Category</option>
                      <option value="status">Status</option>
                    </select>
                  </div>

                  {/* Tag Filter */}
                  {allTags.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Filter by tags:</label>
                      <div className="flex flex-wrap gap-2">
                        {allTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => {
                              if (selectedTags.includes(tag)) {
                                setSelectedTags(selectedTags.filter(t => t !== tag));
                              } else {
                                setSelectedTags([...selectedTags, tag]);
                              }
                            }}
                            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                              selectedTags.includes(tag)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                        {selectedTags.length > 0 && (
                          <button
                            onClick={() => setSelectedTags([])}
                            className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 border border-red-300 hover:bg-red-200"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Results Summary */}
                  <div className="text-sm text-gray-600">
                    Showing {filteredTasks.length} of {tasks.length} tasks
                    {selectedTags.length > 0 && (
                      <span> • Filtered by: {selectedTags.join(', ')}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-body">
                <TaskList
                  tasks={filteredTasks}
                  onTaskStatusUpdate={handleTaskStatusUpdate}
                  onTaskTagsUpdate={handleTaskTagsUpdate}
                  onTaskScheduleUpdate={handleTaskScheduleUpdate}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
