import React from 'react';

export default function ComponentLoading() {
  return (
    <div className="flex h-full min-h-[200px] w-full items-center justify-center p-4">
      <div className="relative flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-slate-100 dark:border-slate-800" />
        
        <div className="absolute h-10 w-10 animate-spin rounded-full border-4 border-transparent border-t-indigo-600 border-r-indigo-500" />
      </div>
    </div>
  );
}
