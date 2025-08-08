import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import TaskForm from "../Tasks/TaskForm";
import TaskList from "../Tasks/TaskList";
import { taskAPI, supabase } from "../../api/supabaseClient";

export default function Dashboard() {
  const { user, session } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        const userTasks = await taskAPI.fetchUserTasks(user.id);
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

  // Handle refresh tasks
  const handleRefreshTasks = async () => {
    if (!user?.id) return;

    try {
      setError("");
      const userTasks = await taskAPI.fetchUserTasks(user.id);
      setTasks(userTasks);
    } catch (err) {
      console.error("Failed to refresh tasks:", err);
      setError("Failed to refresh tasks. Please try again.");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              </div>
              <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{tasks.length}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">{pendingTasks}</div>
                  <div className="text-xs text-gray-500">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{completedTasks}</div>
                  <div className="text-xs text-gray-500">Done</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-xs">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate("/login");
                  }}
                  className="btn btn-danger btn-sm"
                >
                  Logout
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
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleRefreshTasks}
                    className="btn btn-secondary btn-sm flex items-center space-x-2 hover:bg-gray-200 transition-colors"
                    title="Refresh tasks"
                  >
                    <span className="text-sm">🔄</span>
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                  <span className="badge badge-primary text-sm px-3 py-1">
                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <TaskList
                tasks={tasks}
                onTaskStatusUpdate={handleTaskStatusUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
