// src/components/Skeleton/FormSkeleton.jsx
import React from "react";

export default function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Title */}
      {/* <div className="h-6 w-48 bg-gray-300 rounded-md mx-auto mb-4" /> */}

      {/* First Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded-md" />
        ))}
      </div>

      {/* Second Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded-md" />
        ))}
      </div>

      {/* Textarea */}
      {/* <div className="h-24 bg-gray-300 rounded-md" /> */}

      {/* Another Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded-md" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded-md" />
        ))}
      </div>

      {/* Button */}
      <div className="h-10 w-32 bg-gray-200 rounded-md mt-6" />
    </div>
  );
}
