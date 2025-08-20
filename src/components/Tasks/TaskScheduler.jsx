import React, { useState, useEffect } from "react";
import { parseTimeEstimate, calculateEndDate, formatDateTimeLocal, formatDisplayDate, formatDuration } from "../../utils/timeUtils";

export default function TaskScheduler({ task, onSave, onCancel }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [autoCalculateEnd, setAutoCalculateEnd] = useState(true);
  const [loading, setLoading] = useState(false);
  const [estimatedDuration, setEstimatedDuration] = useState(0);

  useEffect(() => {
    // Initialize with existing dates or defaults
    if (task.start_date) {
      setStartDate(formatDateTimeLocal(task.start_date));
    }
    if (task.end_date) {
      setEndDate(formatDateTimeLocal(task.end_date));
      setAutoCalculateEnd(false);
    }

    // Parse estimated time
    const duration = parseTimeEstimate(task.time_estimate);
    setEstimatedDuration(duration);
  }, [task]);

  useEffect(() => {
    // Auto-calculate end date when start date changes
    if (autoCalculateEnd && startDate && estimatedDuration > 0) {
      const calculatedEnd = calculateEndDate(startDate, estimatedDuration);
      if (calculatedEnd) {
        setEndDate(formatDateTimeLocal(calculatedEnd));
      }
    }
  }, [startDate, estimatedDuration, autoCalculateEnd]);

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setAutoCalculateEnd(false); // Disable auto-calculation when manually changed
  };

  const handleAutoCalculateToggle = () => {
    setAutoCalculateEnd(!autoCalculateEnd);
    if (!autoCalculateEnd && startDate && estimatedDuration > 0) {
      // Re-calculate end date
      const calculatedEnd = calculateEndDate(startDate, estimatedDuration);
      if (calculatedEnd) {
        setEndDate(formatDateTimeLocal(calculatedEnd));
      }
    }
  };

  const handleSave = async () => {
    if (!startDate) {
      alert("Please select a start date and time");
      return;
    }

    setLoading(true);
    try {
      const startDateTime = startDate ? new Date(startDate).toISOString() : null;
      const endDateTime = endDate ? new Date(endDate).toISOString() : null;
      
      await onSave(task.id, startDateTime, endDateTime);
    } catch (error) {
      console.error("Failed to save schedule:", error);
      alert("Failed to save schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSchedule = async () => {
    setLoading(true);
    try {
      await onSave(task.id, null, null);
    } catch (error) {
      console.error("Failed to clear schedule:", error);
      alert("Failed to clear schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    return formatDateTimeLocal(now);
  };

  return (
    <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-blue-900 text-sm">Schedule Task</h4>
        <div className="text-xs text-blue-700">
          Estimated: {formatDuration(estimatedDuration)}
        </div>
      </div>

      {/* Current Schedule Display */}
      {task.start_date && (
        <div className="mb-3 p-2 bg-white rounded border border-blue-100">
          <div className="text-xs text-gray-600 mb-1">Current Schedule:</div>
          <div className="text-sm">
            <span className="font-medium">Start:</span> {formatDisplayDate(task.start_date)}
          </div>
          {task.end_date && (
            <div className="text-sm">
              <span className="font-medium">End:</span> {formatDisplayDate(task.end_date)}
            </div>
          )}
        </div>
      )}

      {/* Start Date Input */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Start Date & Time:
        </label>
        <input
          type="datetime-local"
          value={startDate}
          onChange={handleStartDateChange}
          min={getMinDateTime()}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Auto-calculate toggle */}
      <div className="mb-3">
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={autoCalculateEnd}
            onChange={handleAutoCalculateToggle}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700">Auto-calculate end time</span>
        </label>
      </div>

      {/* End Date Input */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          End Date & Time:
        </label>
        <input
          type="datetime-local"
          value={endDate}
          onChange={handleEndDateChange}
          disabled={autoCalculateEnd}
          className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            autoCalculateEnd ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
        {autoCalculateEnd && (
          <div className="text-xs text-gray-500 mt-1">
            End time calculated automatically based on estimated duration
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div className="flex space-x-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          {(task.start_date || task.end_date) && (
            <button
              onClick={handleClearSchedule}
              disabled={loading}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Clear Schedule
            </button>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={loading || !startDate}
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Schedule"}
        </button>
      </div>
    </div>
  );
}
