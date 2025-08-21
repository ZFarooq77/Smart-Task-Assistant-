//TaskList.jsx to display user tasks with completion toggle, tag management, and scheduling
import React, { useState } from "react";
import TagManager from "./TagManager";
import TaskScheduler from "./TaskScheduler";
import { formatDisplayDate, getTaskScheduleStatus } from "../../utils/timeUtils";

// Function to format summary steps
const formatSummarySteps = (summary) => {
  if (!summary) return [];

  // Split by "Step" and clean up
  const steps = summary.split(/Step \d+:/).filter(step => step.trim());

  // If no "Step X:" pattern found, try splitting by periods or commas
  if (steps.length <= 1) {
    const altSteps = summary.split(/[.;]/).filter(step => step.trim() && step.length > 10);
    if (altSteps.length > 1) return altSteps;
  }

  return steps.length > 1 ? steps : [summary];
};

export default function TaskList({ tasks, onTaskStatusUpdate, onTaskTagsUpdate, onTaskScheduleUpdate }) {
  const [editingTags, setEditingTags] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Debug: Log task data to help identify issues
  console.log("🔍 TaskList received tasks:", tasks);
  if (tasks && tasks.length > 0) {
    console.log("🔍 First task structure:", tasks[0]);
    console.log("🔍 First task tags:", tasks[0].tags, "Type:", typeof tasks[0].tags);
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-4">
        No tasks yet. Add your first task above!
      </div>
    );
  }

  const handleToggleComplete = (taskId, currentStatus) => {
    onTaskStatusUpdate(taskId, !currentStatus);
  };

  const handleTagsUpdate = async (taskId, newTags) => {
    if (onTaskTagsUpdate) {
      await onTaskTagsUpdate(taskId, newTags);
    }
    setEditingTags(null);
  };

  const handleScheduleUpdate = async (taskId, startDate, endDate) => {
    if (onTaskScheduleUpdate) {
      await onTaskScheduleUpdate(taskId, startDate, endDate);
    }
    setEditingSchedule(null);
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`card transition-all duration-300 hover:scale-[1.01] ${
            task.is_done
              ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50"
              : "hover:shadow-lg"
          }`}
        >
          <div className="card-body">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    task.is_done ? "bg-green-500" : "bg-yellow-500"
                  }`}></div>
                  <h3 className={`font-semibold text-lg leading-tight ${
                    task.is_done ? "text-green-800 line-through" : "text-gray-900"
                  }`}>
                    {task.description}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 ml-5">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-xs">🏷️</span>
                    <span className={`badge ${getCategoryColor(task.category)} text-xs font-medium`}>
                      {task.category || "Uncategorized"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-xs">⏱️</span>
                    <span className="text-sm text-gray-600 font-medium">
                      {task.time_estimate || "Not estimated"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-xs">{task.is_done ? "✅" : "⏳"}</span>
                    <span className={`badge text-xs font-medium ${
                      task.is_done ? "badge-success" : "badge-warning"
                    }`}>
                      {task.is_done ? "Completed" : "Pending"}
                    </span>
                  </div>
                </div>

                {/* Tags Section */}
                <div className="ml-5 mt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-xs">🏷️</span>
                      <span className="text-xs text-gray-600 font-medium">Tags:</span>
                    </div>
                    <button
                      onClick={() => setEditingTags(editingTags === task.id ? null : task.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {editingTags === task.id ? "Cancel" : "Edit"}
                    </button>
                  </div>

                  {editingTags === task.id ? (
                    <TagManager
                      taskId={task.id}
                      currentTags={Array.isArray(task.tags) ? task.tags : []}
                      onSave={handleTagsUpdate}
                      onCancel={() => setEditingTags(null)}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags && Array.isArray(task.tags) && task.tags.length > 0 ? (
                        task.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">No tags</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Schedule Section */}
                <div className="ml-5 mt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-xs">📅</span>
                      <span className="text-xs text-gray-600 font-medium">Schedule:</span>
                    </div>
                    <button
                      onClick={() => setEditingSchedule(editingSchedule === task.id ? null : task.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {editingSchedule === task.id ? "Cancel" : "Schedule"}
                    </button>
                  </div>

                  {editingSchedule === task.id ? (
                    <TaskScheduler
                      task={task}
                      onSave={handleScheduleUpdate}
                      onCancel={() => setEditingSchedule(null)}
                    />
                  ) : (
                    <div className="mt-2">
                      {task.start_date ? (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              getTaskScheduleStatus(task).status === 'completed' ? 'bg-green-100 text-green-800' :
                              getTaskScheduleStatus(task).status === 'overdue' ? 'bg-red-100 text-red-800' :
                              getTaskScheduleStatus(task).status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {getTaskScheduleStatus(task).status === 'completed' ? '✅ Completed' :
                               getTaskScheduleStatus(task).status === 'overdue' ? '⚠️ Overdue' :
                               getTaskScheduleStatus(task).status === 'in-progress' ? '🔄 In Progress' :
                               '📅 Scheduled'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            <div><span className="font-medium">Start:</span> {formatDisplayDate(task.start_date)}</div>
                            {task.end_date && (
                              <div><span className="font-medium">End:</span> {formatDisplayDate(task.end_date)}</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Not scheduled</span>
                      )}
                    </div>
                  )}
                </div>

                {task.summary && (
                  <div className="ml-5 mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-blue-600 text-sm">📝</span>
                      <h4 className="font-semibold text-blue-900 text-sm">Action Plan</h4>
                    </div>
                    <div className="pl-6 space-y-2">
                      {formatSummarySteps(task.summary).map((step, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <span className="text-blue-600 font-semibold text-xs mt-0.5 min-w-[20px]">
                            {index + 1}.
                          </span>
                          <p className="text-sm text-blue-800 leading-relaxed">
                            {step.trim()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex sm:flex-col gap-2 sm:ml-4">
                <button
                  onClick={() => handleToggleComplete(task.id, task.is_done)}
                  className={`btn btn-sm flex items-center space-x-2 ${
                    task.is_done
                      ? "btn-secondary"
                      : "btn-success"
                  }`}
                >
                  <span className="text-sm">
                    {task.is_done ? "↶" : "✓"}
                  </span>
                  <span className="hidden sm:inline">
                    {task.is_done ? "Undo" : "Complete"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper function to get category-specific colors
function getCategoryColor(category) {
  const colors = {
    'Work': 'badge-primary',
    'Personal': 'bg-purple-100 text-purple-800',
    'Health': 'badge-success',
    'Learning': 'bg-orange-100 text-orange-800',
    'Finance': 'badge-warning',
    'Home': 'bg-indigo-100 text-indigo-800',
  };

  return colors[category] || 'badge-secondary';
}
