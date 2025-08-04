//TaskForm.jsx to send the new task to your n8n /add-task webhook.
import React from "react";

export default function TaskList({ tasks }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-4">
        No tasks yet. Add your first task above!
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white shadow rounded-lg p-4 border border-gray-200"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">{task.description}</h3>
            <span
              className={`px-3 py-1 text-xs rounded-full ${
                task.is_done
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {task.is_done ? "Done" : "Pending"}
            </span>
          </div>

          <div className="mt-2">
            <p className="text-sm text-gray-500">
              <strong>Category:</strong> {task.category}
            </p>
            <p className="text-sm text-gray-500">
              <strong>Time Estimate:</strong> {task.time_estimate}
            </p>
            <p className="text-sm text-gray-500">
              <strong>Summary:</strong> {task.summary}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
