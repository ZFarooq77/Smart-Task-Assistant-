//TaskForm.jsx to send the new task to your n8n /add-task webhook.

import React, { useState } from "react";

export default function TaskForm({ token, onTaskAdded }) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("http://localhost:5678/webhook-test/process-task", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`, // Send Supabase JWT
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ description })
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const newTask = await res.json();
      onTaskAdded(newTask); // Update Dashboard state
      setDescription(""); // Clear form
    } catch (err) {
      console.error("Task submission failed:", err);
      setErrorMsg("Failed to add task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 bg-gray-50 p-4 rounded-lg shadow"
    >
      {errorMsg && <p className="text-red-500 mb-3">{errorMsg}</p>}

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Enter your task..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-5 py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Task"}
        </button>
      </div>
    </form>
  );
}
