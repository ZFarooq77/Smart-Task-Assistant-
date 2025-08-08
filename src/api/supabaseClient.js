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
      // First try n8n webhook
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
        const errorText = await response.text();
        console.error("n8n webhook error - Status:", response.status, "Response:", errorText);

        // If n8n webhook fails, fallback to direct database insert
        console.log("Falling back to direct database insert...");
        return await this.createTaskDirectly(description, userId);
      }

      const result = await response.json();
      console.log("n8n webhook response:", result);

      // Check if the response contains task data
      if (result && result.success) {
        if (result.task) {
          // If n8n returns the task data, use it
          console.log("n8n webhook returned task data:", result.task);
          return result.task;
        } else {
          // If n8n returns success but no task data, fetch the latest task for this user
          console.log("n8n webhook succeeded, fetching latest task...");
          const tasks = await this.fetchUserTasks(userId);
          return tasks[0]; // Return the most recent task
        }
      }

      // If result doesn't have success field but has task data directly, handle it
      if (result && (result.id || result.user_id)) {
        console.log("n8n webhook returned task data directly:", result);
        return result;
      }

      // If we have any result, try to fetch the latest task as fallback
      if (result) {
        console.log("n8n webhook returned unknown format, fetching latest task...");
        const tasks = await this.fetchUserTasks(userId);
        if (tasks && tasks.length > 0) {
          return tasks[0]; // Return the most recent task
        }
      }

      // If we get here, something went wrong
      throw new Error("Invalid response from n8n webhook");
    } catch (error) {
      console.error("n8n webhook failed:", error);
      // Fallback to direct database insert
      console.log("Falling back to direct database insert...");
      return await this.createTaskDirectly(description, userId);
    }
  },

  // Fallback method to create task directly in database
  async createTaskDirectly(description, userId) {
    // Simple AI-like categorization based on keywords
    const category = this.categorizeTask(description);
    const timeEstimate = this.estimateTime(description);
    const summary = this.generateSummary(description);

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: userId,
          description: description,
          category: category,
          time_estimate: timeEstimate,
          summary: summary,
          is_done: false
        }
      ])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Simple categorization logic
  categorizeTask(description) {
    const text = description.toLowerCase();
    if (text.includes('work') || text.includes('meeting') || text.includes('project') || text.includes('email')) return 'Work';
    if (text.includes('exercise') || text.includes('gym') || text.includes('health') || text.includes('doctor')) return 'Health';
    if (text.includes('learn') || text.includes('study') || text.includes('course') || text.includes('read')) return 'Learning';
    if (text.includes('buy') || text.includes('shop') || text.includes('money') || text.includes('budget')) return 'Finance';
    if (text.includes('clean') || text.includes('home') || text.includes('house') || text.includes('repair')) return 'Home';
    return 'Personal';
  },

  // Simple time estimation
  estimateTime(description) {
    const wordCount = description.split(' ').length;
    if (wordCount < 5) return '15-30 minutes';
    if (wordCount < 10) return '30-60 minutes';
    if (wordCount < 20) return '1-2 hours';
    return '2+ hours';
  },

  // Generate simple summary
  generateSummary(description) {
    return `Complete the task: ${description}. Break it down into smaller steps if needed and tackle them one by one.`;
  }
};
