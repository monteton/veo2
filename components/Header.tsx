
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center py-6">
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
          Veo 2 Vertical Video Generator
        </span>
      </h1>
      <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-400">
        Turn your images into dynamic vertical videos with the power of AI.
      </p>
    </header>
  );
};
