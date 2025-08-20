import React, { useState, useEffect } from "react";

export default function TagManager({ taskId, currentTags, onSave, onCancel }) {
  const [tags, setTags] = useState(currentTags || []);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);

  // Common tag suggestions
  const suggestedTags = [
    "Urgent", "Important", "Quick", "Research", "Meeting", "Email", 
    "Call", "Review", "Planning", "Creative", "Technical", "Personal",
    "Work", "Health", "Finance", "Learning", "Home", "Shopping"
  ];

  // Filter out already selected tags from suggestions
  const availableSuggestions = suggestedTags.filter(tag => 
    !tags.some(existingTag => existingTag.toLowerCase() === tag.toLowerCase())
  );

  useEffect(() => {
    setTags(currentTags || []);
  }, [currentTags]);

  const handleAddTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.some(existingTag => 
      existingTag.toLowerCase() === trimmedTag.toLowerCase()
    )) {
      setTags([...tags, trimmedTag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(newTag);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(taskId, tags);
    } catch (error) {
      console.error("Failed to save tags:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* Current Tags */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Current Tags:
        </label>
        <div className="flex flex-wrap gap-1">
          {tags.length > 0 ? (
            tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800 font-bold"
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400 italic">No tags selected</span>
          )}
        </div>
      </div>

      {/* Add New Tag */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Add New Tag:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter tag name..."
            className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => handleAddTag(newTag)}
            disabled={!newTag.trim()}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>

      {/* Suggested Tags */}
      {availableSuggestions.length > 0 && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Quick Add:
          </label>
          <div className="flex flex-wrap gap-1">
            {availableSuggestions.slice(0, 8).map((tag) => (
              <button
                key={tag}
                onClick={() => handleAddTag(tag)}
                className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Tags"}
        </button>
      </div>
    </div>
  );
}
