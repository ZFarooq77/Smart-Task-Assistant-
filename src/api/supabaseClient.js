// src/api/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Get from Supabase dashboard → Project Settings → API
const SUPABASE_URL = "https://fzktdpjtstaxchhckniw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6a3RkcGp0c3RheGNoaGNrbml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDk4NTYsImV4cCI6MjA2ODkyNTg1Nn0.vqKcJIIJuW9ind_dETui_1DIHC7ozhjucX9h0l9dMU8"; // NOT service_role key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Task API functions
export const taskAPI = {
  // Fetch all tasks for a user
  async fetchUserTasks(userId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update task completion status
  async updateTaskStatus(taskId, isDone) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ is_done: isDone })
      .eq('id', taskId)
      .select();

    if (error) throw error;
    return data[0];
  },

  // Submit new task to n8n webhook
  async submitTask(description, token, userId) {
    try {
      console.log("🚀 Sending task to n8n webhook...");

      const response = await fetch("http://localhost:5678/webhook-test/process-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          description,
          user_id: userId,
          token: token
        })
      });

      console.log("📡 n8n response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ n8n webhook failed - Status:", response.status, "Response:", errorText);
        throw new Error(`n8n webhook failed with status ${response.status}: ${errorText}`);
      }

      const responseText = await response.text();
      console.log("📄 n8n raw response:", responseText);

      const result = JSON.parse(responseText);
      console.log("✅ n8n parsed response:", result);

      // Check if result has the task data directly
      if (result && result.id && result.user_id) {
        console.log("🎯 Returning complete task data from n8n:", result);
        return result;
      }

      // If result has success wrapper with task data
      if (result && result.success && result.task) {
        console.log("🎯 Returning task data from success wrapper:", result.task);
        return result.task;
      }

      // If we get any response but no direct task data, wait and fetch from database
      console.log("⏳ n8n responded but no direct task data, fetching from database...");
      await new Promise(resolve => setTimeout(resolve, 2000));

      const tasks = await this.fetchUserTasks(userId);
      if (tasks && tasks.length > 0) {
        console.log("📋 Retrieved latest task from database:", tasks[0]);
        return tasks[0];
      }

      throw new Error("n8n processed task but no task data found");

    } catch (error) {
      console.error("💥 n8n webhook completely failed:", error);
      throw error; // Don't use fallback, let the UI handle the error
    }
  },


};
