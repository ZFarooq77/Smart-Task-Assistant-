//TaskForm.jsx to send the new task to your n8n /add-task webhook.

import React, { useState } from "react";
import { taskAPI } from "../../api/supabaseClient";

export default function TaskForm({ token, userId, onTaskAdded }) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const newTask = await taskAPI.submitTask(description, token, userId);
      console.log("✅ Task submission successful:", newTask);

      if (newTask && (newTask.id || newTask.user_id)) {
        onTaskAdded(newTask); // Update Dashboard state
        setDescription(""); // Clear form
        setErrorMsg(""); // Clear any previous errors
      } else {
        console.warn("⚠️ Task submission returned unexpected format:", newTask);
        setErrorMsg("Task may have been created but couldn't be confirmed. Please refresh to see your tasks.");
      }
    } catch (err) {
      console.error("❌ Task submission failed:", err);

      // Provide specific error messages based on the error
      if (err.message.includes('CORS')) {
        setErrorMsg("❌ n8n backend is not accessible (CORS error). Please make sure n8n is running and configured properly.");
      } else if (err.message.includes('404')) {
        setErrorMsg("❌ n8n webhook endpoint not found. Please check if your n8n workflow is active.");
      } else if (err.message.includes('Failed to fetch')) {
        setErrorMsg("❌ Cannot connect to n8n backend. Please make sure n8n is running on localhost:5678.");
      } else {
        setErrorMsg(`❌ Failed to add task: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-fadeIn">
          <div className="flex items-center">
            <span className="mr-2 text-red-600 font-bold">✕</span>
            {errorMsg}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <textarea
              placeholder="Describe what you need to accomplish..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 text-base font-medium resize-none"
              rows="3"
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              Be specific about your task for better AI analysis and time estimation
            </p>
          </div>

          <div className="flex sm:flex-col gap-2">
            <button
              type="submit"
              disabled={loading || !description.trim()}
              className="btn btn-primary btn-lg flex items-center justify-center space-x-2 min-w-[140px] h-fit"
            >
              {loading ? (
                <>
                  <span className="animate-pulse mr-2">●</span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span className="mr-2">+</span>
                  <span>Add Task</span>
                </>
              )}
            </button>

            {description.trim() && (
              <button
                type="button"
                onClick={() => setDescription("")}
                className="btn btn-secondary btn-sm flex items-center justify-center"
              >
                <span className="text-sm">✕</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
