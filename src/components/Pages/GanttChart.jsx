import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { taskAPI } from "../../api/supabaseClient";
import { formatDisplayDate, getTaskScheduleStatus, datesOverlap } from "../../utils/timeUtils";
import GradientLogo from "../UI/GradientLogo";

export default function GanttChart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("week"); // week, month
  const [currentDate, setCurrentDate] = useState(new Date());
  const [unscheduledCollapsed, setUnscheduledCollapsed] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch tasks
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

  // Filter scheduled tasks
  const scheduledTasks = tasks.filter(task => task.start_date);
  const unscheduledTasks = tasks.filter(task => !task.start_date);

  // Generate time slots based on view mode
  const generateTimeSlots = () => {
    const slots = [];
    const start = new Date(currentDate);
    const daysToShow = viewMode === "week" ? 7 : 30;
    
    start.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      slots.push(date);
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Navigate time periods
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - (viewMode === "week" ? 7 : 30));
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (viewMode === "week" ? 7 : 30));
    setCurrentDate(newDate);
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // Check if task is visible in current time range
  const isTaskInTimeRange = (task) => {
    if (!task.start_date) return false;
    
    const taskStart = new Date(task.start_date);
    const rangeStart = timeSlots[0];
    const rangeEnd = new Date(timeSlots[timeSlots.length - 1]);
    rangeEnd.setHours(23, 59, 59, 999);
    
    return taskStart >= rangeStart && taskStart <= rangeEnd;
  };

  const visibleTasks = scheduledTasks.filter(isTaskInTimeRange);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-3">
              <GradientLogo />
              <h1 className="text-3xl font-bold text-gray-900">Task Schedule</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === "week" 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === "month" 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={navigatePrevious}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg border border-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === "week" 
                ? `Week of ${timeSlots[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                : `${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
              }
            </h2>
            <button
              onClick={navigateNext}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg border border-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <button
            onClick={navigateToday}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Today
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{scheduledTasks.length}</div>
            <div className="text-sm text-gray-600">Scheduled Tasks</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-600">{unscheduledTasks.length}</div>
            <div className="text-sm text-gray-600">Unscheduled Tasks</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.is_done).length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {scheduledTasks.filter(t => getTaskScheduleStatus(t).status === 'overdue').length}
            </div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Timeline View</h3>
          </div>
          
          {visibleTasks.length > 0 ? (
            <div className="p-4">
              <div className="space-y-3">
                {visibleTasks.map((task) => {
                  const status = getTaskScheduleStatus(task);
                  return (
                    <div key={task.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`w-3 h-3 rounded-full ${
                            status.status === 'completed' ? 'bg-green-500' :
                            status.status === 'overdue' ? 'bg-red-500' :
                            status.status === 'in-progress' ? 'bg-blue-500' :
                            'bg-yellow-500'
                          }`}></span>
                          <h4 className="font-medium text-gray-900 truncate">{task.description}</h4>
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                          <span>📅 {formatDisplayDate(task.start_date)}</span>
                          {task.end_date && <span>→ {formatDisplayDate(task.end_date)}</span>}
                          <span className="text-blue-600">🏷️ {task.category}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        status.status === 'completed' ? 'bg-green-100 text-green-800' :
                        status.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        status.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {status.status === 'completed' ? 'Completed' :
                         status.status === 'overdue' ? 'Overdue' :
                         status.status === 'in-progress' ? 'In Progress' :
                         'Scheduled'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-medium mb-2">No scheduled tasks in this time period</h3>
              <p className="text-sm">Schedule some tasks from your dashboard to see them here.</p>
            </div>
          )}
        </div>

        {/* Unscheduled Tasks */}
        {unscheduledTasks.length > 0 && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200">
            <div
              className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setUnscheduledCollapsed(!unscheduledCollapsed)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Unscheduled Tasks</h3>
                  <p className="text-sm text-gray-600">These tasks need to be scheduled ({unscheduledTasks.length})</p>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      unscheduledCollapsed ? '-rotate-90' : 'rotate-0'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            {!unscheduledCollapsed && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {unscheduledTasks.map((task) => (
                    <div key={task.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900 text-sm mb-1">{task.description}</h4>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>🏷️ {task.category}</span>
                        <span>⏱️ {task.time_estimate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
