// Utility functions for time parsing and calculations

/**
 * Parse time estimate string and return duration in minutes
 * Examples: "2 hours", "30 minutes", "1.5 hours", "45 mins", "1 hour 30 minutes"
 */
export const parseTimeEstimate = (timeString) => {
  if (!timeString || typeof timeString !== 'string') {
    return 60; // Default to 1 hour if no estimate
  }

  const str = timeString.toLowerCase().trim();
  let totalMinutes = 0;

  // Handle various formats
  const patterns = [
    // "2 hours", "1.5 hours", "0.5 hour"
    { regex: /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/g, multiplier: 60 },
    // "30 minutes", "45 mins", "15 min"
    { regex: /(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|m)\b/g, multiplier: 1 },
    // "2 days" (convert to hours)
    { regex: /(\d+(?:\.\d+)?)\s*(?:days?|d)\b/g, multiplier: 60 * 24 },
    // "3 weeks" (convert to hours)
    { regex: /(\d+(?:\.\d+)?)\s*(?:weeks?|w)\b/g, multiplier: 60 * 24 * 7 }
  ];

  patterns.forEach(({ regex, multiplier }) => {
    let match;
    while ((match = regex.exec(str)) !== null) {
      totalMinutes += parseFloat(match[1]) * multiplier;
    }
  });

  // If no patterns matched, try to extract just numbers and assume hours
  if (totalMinutes === 0) {
    const numberMatch = str.match(/(\d+(?:\.\d+)?)/);
    if (numberMatch) {
      totalMinutes = parseFloat(numberMatch[1]) * 60; // Assume hours
    }
  }

  return totalMinutes || 60; // Default to 1 hour if parsing fails
};

/**
 * Calculate end date based on start date and duration in minutes
 */
export const calculateEndDate = (startDate, durationMinutes) => {
  if (!startDate || !durationMinutes) return null;
  
  const start = new Date(startDate);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return end;
};

/**
 * Format duration in minutes to human readable string
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return "0 minutes";
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  } else if (mins === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
  }
};

/**
 * Format date for datetime-local input
 */
export const formatDateTimeLocal = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Format date for display
 */
export const formatDisplayDate = (date) => {
  if (!date) return 'Not scheduled';
  
  const d = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  const timeString = d.toLocaleTimeString('en-US', options);
  
  if (taskDate.getTime() === today.getTime()) {
    return `Today at ${timeString}`;
  } else if (taskDate.getTime() === today.getTime() + 24 * 60 * 60 * 1000) {
    return `Tomorrow at ${timeString}`;
  } else if (taskDate.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
    return `Yesterday at ${timeString}`;
  } else {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
};

/**
 * Check if two date ranges overlap
 */
export const datesOverlap = (start1, end1, start2, end2) => {
  if (!start1 || !end1 || !start2 || !end2) return false;
  
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);
  
  return s1 < e2 && s2 < e1;
};

/**
 * Get task status based on dates
 */
export const getTaskScheduleStatus = (task) => {
  const now = new Date();
  
  if (!task.start_date) {
    return { status: 'unscheduled', color: 'gray' };
  }
  
  const startDate = new Date(task.start_date);
  const endDate = task.end_date ? new Date(task.end_date) : null;
  
  if (task.is_done) {
    return { status: 'completed', color: 'green' };
  }
  
  if (endDate && now > endDate) {
    return { status: 'overdue', color: 'red' };
  }
  
  if (now >= startDate && (!endDate || now <= endDate)) {
    return { status: 'in-progress', color: 'blue' };
  }
  
  if (now < startDate) {
    return { status: 'scheduled', color: 'yellow' };
  }
  
  return { status: 'scheduled', color: 'yellow' };
};
