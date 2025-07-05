import React from 'react';

const SkeletonLoader = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="p-4 border border-light-gray rounded-md animate-pulse">
        <div className="h-6 bg-light-gray rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-light-gray rounded w-1/2 mb-4"></div>
        <div className="flex items-center gap-4 text-xs">
          <div className="h-4 bg-light-gray rounded w-1/4"></div>
          <div className="h-4 bg-light-gray rounded w-1/4"></div>
        </div>
      </div>
    ))}
  </div>
);

export default SkeletonLoader;
