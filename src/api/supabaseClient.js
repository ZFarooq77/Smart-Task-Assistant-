// src/api/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Get configuration from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables. Please check your .env file.');
}
if (!N8N_WEBHOOK_URL) {
  throw new Error('Missing required n8n webhook URL environment variable. Please check your .env file.');
}

// Log configuration (without sensitive data)
console.log('🔧 Configuration loaded:');
console.log('  - Supabase URL:', SUPABASE_URL);
console.log('  - n8n Webhook URL:', N8N_WEBHOOK_URL);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Task API functions
export const taskAPI = {
  // Fetch all tasks for a user
  async fetchUserTasks(userId) {
    console.log("🔍 Fetching tasks for user_id:", userId);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ Database error fetching tasks:", error);
      throw error;
    }

    console.log("🔍 Raw database response:", data);
    console.log("🔍 Number of tasks from database:", data?.length || 0);

    // Convert is_done strings to proper booleans
    if (data) {
      data.forEach(task => {
        task.is_done = task.is_done === true || task.is_done === "true";
      });
    }

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

  // Update task tags
  async updateTaskTags(taskId, tags) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ tags: tags })
      .eq('id', taskId)
      .select();

    if (error) throw error;
    return data[0];
  },

  // Update task schedule (start_date and end_date)
  async updateTaskSchedule(taskId, startDate, endDate) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        start_date: startDate,
        end_date: endDate
      })
      .eq('id', taskId)
      .select();

    if (error) throw error;
    return data[0];
  },

  // Submit new task to n8n webhook
  async submitTask(description, token, userId) {
    // Validate required parameters
    if (!description || !description.trim()) {
      throw new Error("Task description is required");
    }
    if (!token) {
      throw new Error("Authentication token is required");
    }
    if (!userId) {
      throw new Error("User ID is required");
    }

    try {
      console.log("🚀 Sending task to n8n webhook...");
      console.log("🔗 Webhook URL:", N8N_WEBHOOK_URL);
      console.log("🔑 Token being sent:", token ? `${token.substring(0, 20)}...` : 'undefined/null');
      console.log("👤 User ID being sent:", userId);
      console.log("📝 Description being sent:", description);

      // Prepare headers with proper authorization format
      const headers = {
        "Content-Type": "application/json"
      };

      // Add authorization header only if token is available and valid
      if (token && token.trim()) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          description,
          user_id: userId  // Send user_id as backup while n8n JWT extraction is being set up
        })
      });

      console.log("📡 n8n response status:", response.status);
      console.log("📡 n8n response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ n8n webhook failed - Status:", response.status, "Response:", errorText);

        // Provide more specific error messages based on status code
        if (response.status === 401) {
          throw new Error(`JWT Authentication failed: Invalid or expired token. Please try logging out and back in.`);
        } else if (response.status === 403) {
          throw new Error(`JWT Authorization failed: Token is valid but lacks required permissions.`);
        } else if (response.status === 400) {
          throw new Error(`Bad request: ${errorText}`);
        } else if (response.status === 404) {
          throw new Error(`n8n webhook endpoint not found. Please check if your n8n workflow is active.`);
        } else {
          throw new Error(`n8n webhook failed with status ${response.status}: ${errorText}`);
        }
      }

      const responseText = await response.text();
      console.log("📄 n8n raw response:", responseText);
      console.log("📄 n8n response length:", responseText.length);
      console.log("📄 n8n response type:", typeof responseText);

      // Check if response is empty
      if (!responseText || responseText.trim() === '') {
        console.error("❌ n8n returned empty response");
        throw new Error("n8n returned empty response. Check if your workflow has a 'Respond to Webhook' node at the end.");
      }

      let result;
      try {
        result = JSON.parse(responseText);
        console.log("✅ n8n parsed response:", result);
      } catch (parseError) {
        console.error("❌ Failed to parse n8n response as JSON:", parseError);
        console.error("❌ Raw response that failed to parse:", JSON.stringify(responseText));
        throw new Error(`Invalid response format from n8n. Expected JSON but got: "${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}"`);
      }

      // Check if result has the task data directly
      if (result && result.id && result.user_id) {
        console.log("🎯 Returning complete task data from n8n:", result);
        // Convert is_done string to boolean
        result.is_done = result.is_done === true || result.is_done === "true";
        return result;
      }

      // If result has success wrapper with task data
      if (result && result.success && result.task) {
        console.log("🎯 Returning task data from success wrapper:", result.task);
        // Convert is_done string to boolean
        result.task.is_done = result.task.is_done === true || result.task.is_done === "true";
        return result.task;
      }

      // If we get any response but no direct task data, wait and fetch from database
      console.log("⏳ n8n responded but no direct task data, fetching from database...");
      await new Promise(resolve => setTimeout(resolve, 2000));

      const tasks = await this.fetchUserTasks(userId);
      if (tasks && tasks.length > 0) {
        console.log("📋 Retrieved latest task from database:", tasks[0]);
        // Convert is_done string to boolean for database fetched tasks
        const latestTask = tasks[0];
        latestTask.is_done = latestTask.is_done === true || latestTask.is_done === "true";
        return latestTask;
      }

      throw new Error("n8n processed task but no task data found");

    } catch (error) {
      console.error("💥 n8n webhook completely failed:", error);
      throw error; // Don't use fallback, let the UI handle the error
    }
  },


};
