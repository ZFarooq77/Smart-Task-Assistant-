//TaskList.jsx to display user tasks with completion toggle
import React from "react";

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

export default function TaskList({ tasks, onTaskStatusUpdate }) {
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
