import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../Auth/LogoutButton";
import TaskForm from "../Tasks/TaskForm";
import TaskList from "../Tasks/TaskList";

export default function Dashboard() {
  const { user, session } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Welcome, {user?.email}</h1>
          <LogoutButton />
        </div>

        <TaskForm
          token={session?.access_token}
          onTaskAdded={(newTask) => setTasks([newTask, ...tasks])}
        />

        <TaskList tasks={tasks} />
      </div>
    </div>
  );
}
