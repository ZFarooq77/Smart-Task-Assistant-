# Task Management Frontend

A React.js frontend application for the AI-powered task management system that connects to an n8n backend workflow.

## Features

### ✅ Implemented Features

- **User Authentication**: Secure login and signup using Supabase Auth with JWT tokens
- **Protected Routes**: Dashboard is only accessible to authenticated users
- **Task Input Form**: Clean, user-friendly form for submitting task descriptions
- **Dashboard View**:
  - Displays newly submitted tasks with AI analysis results
  - Shows list of user's past tasks
  - Real-time updates when new tasks are added
- **Task Management**:
  - Mark tasks as complete/pending with toggle buttons
  - Visual status indicators (completed tasks are highlighted in green)
  - Enhanced task display with category-specific colors
- **AI Integration Results Display**:
  - Task categorization (Work, Personal, Health, Learning, etc.)
  - Time estimation display
  - Action plan/summary with step-by-step guidance
- **Responsive Design**: Built with TailwindCSS for mobile-friendly interface
- **Loading States**: Proper loading indicators for all async operations
- **Error Handling**: User-friendly error messages for failed operations

## Tech Stack

- **React 18** - Frontend framework
- **React Router DOM** - Client-side routing
- **TailwindCSS** - Styling and responsive design
- **Supabase** - Authentication and database
- **Vite** - Build tool and development server

## Project Structure

```
app/
├── src/
│   ├── api/
│   │   └── supabaseClient.js      # Supabase client and task API functions
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.jsx      # Login form component
│   │   │   ├── SignupForm.jsx     # Signup form component
│   │   │   └── LogoutButton.jsx   # Logout functionality
│   │   ├── Pages/
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Signup.jsx         # Signup page
│   │   │   └── Dashboard.jsx      # Main dashboard
│   │   └── Tasks/
│   │       ├── TaskForm.jsx       # Task submission form
│   │       └── TaskList.jsx       # Task display component
│   ├── context/
│   │   └── AuthContext.jsx        # Authentication context provider
│   ├── App.jsx                    # Main app component with routing
│   └── main.jsx                   # App entry point
├── package.json
└── vite.config.js
```

## Setup Instructions

1. **Install Dependencies**:

   ```bash
   cd app
   npm install
   ```

2. **Environment Setup**:

   - Copy `.env.example` to `.env` and fill in your actual values:
     ```bash
     cp .env.example .env
     ```
   - Update `.env` with your credentials:
     - `VITE_GROQ_API_KEY`: Your Groq API key
     - `VITE_GROQ_MODEL`: Your preferred Groq model (e.g., llama-3.3-70b-versatile)
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
     - `VITE_N8N_WEBHOOK_URL`: Your n8n webhook endpoint
   - Make sure your n8n workflow is running on the configured URL

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## Usage

1. **Sign Up**: Create a new account using email and password
2. **Login**: Sign in with your credentials
3. **Add Tasks**: Use the task input form to describe what you want to accomplish
4. **View Results**: See AI-generated categorization, time estimates, and action plans
5. **Manage Tasks**: Mark tasks as complete or pending using the toggle buttons
6. **Task History**: View all your past tasks in the dashboard

## API Integration

The frontend connects to your n8n backend workflow at:

- **Endpoint**: `http://localhost:5678/webhook-test/process-task`
- **Method**: POST
- **Headers**:
  - `Authorization: Bearer {supabase_jwt_token}`
  - `Content-Type: application/json`
- **Payload**:
  ```json
  {
    "description": "Task description",
    "user_id": "authenticated_user_id"
  }
  ```

## Database Schema Expected

The application expects a `tasks` table in Supabase with these columns:

- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `description` (text)
- `category` (text)
- `time_estimate` (text)
- `summary` (text)
- `is_done` (boolean, default false)
- `created_at` (timestamp)

## Key Improvements Made

1. **Real User Authentication**: Replaced hardcoded user ID with actual Supabase user authentication
2. **Task Loading**: Dashboard now fetches and displays existing user tasks on load
3. **Task Completion**: Added toggle functionality to mark tasks as complete/pending
4. **Enhanced UI**: Improved task display with better styling, category colors, and status indicators
5. **Error Handling**: Comprehensive error handling with user-friendly messages
6. **Loading States**: Added loading spinners and states for better UX
7. **Responsive Design**: Mobile-friendly interface with proper responsive layouts

## Testing

To test the complete functionality:

1. **Authentication Flow**:

   - Sign up with a new email/password
   - Login with the credentials
   - Verify redirect to dashboard

2. **Task Management**:

   - Submit a new task description
   - Verify it appears in the task list with AI analysis
   - Toggle task completion status
   - Refresh page to ensure tasks persist

3. **Integration Testing**:
   - Ensure n8n workflow is running
   - Submit tasks and verify they're processed by the AI
   - Check that tasks are saved to Supabase database

## Next Steps

- Add task editing functionality
- Implement task filtering and sorting
- Add task due dates and reminders
- Implement task categories management
- Add data export functionality
