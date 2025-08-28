
import React from 'react';

interface VideoPlayerProps {
  src: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  return (
    <div className="w-full max-w-sm mx-auto bg-black rounded-lg overflow-hidden shadow-lg border-2 border-indigo-500/50">
      <video
        src={src}
        controls
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-auto aspect-[9/16] object-cover"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};
