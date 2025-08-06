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
    const response = await fetch("http://localhost:5678/webhook-test/process-task", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        description,
        user_id: userId // Include user_id in the request
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
};
