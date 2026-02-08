import React, { useState, useRef } from 'react';
import Button from '../shared/Button';

interface VideoPlayerProps {
  title: string;
  duration: string;
  onPlay?: () => void;
  onPause?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ title, duration, onPlay, onPause }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('04:12');
  const [progress, setProgress] = useState(33);

  const togglePlay = () => {
    const newPlayState = !isPlaying;
    setIsPlaying(newPlayState);
    
    if (newPlayState) {
      onPlay?.();
      // Simulate video progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      onPause?.();
    }
  };

  return (
    <div className="relative bg-black aspect-video">
      {/* Neural Network Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center">
        <div className="relative">
          {/* Animated Neural Network */}
          <div className="absolute inset-0 opacity-30">
            <svg width="400" height="300" viewBox="0 0 400 300" className="animate-pulse">
              <defs>
                <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Animated connections */}
              <g filter="url(#glow)">
                <line x1="88" y1="100" x2="192" y2="75" stroke="#60A5FA" strokeWidth="2" opacity="0.8">
                  <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
                </line>
                <line x1="88" y1="150" x2="192" y2="125" stroke="#60A5FA" strokeWidth="2" opacity="0.6">
                  <animate attributeName="opacity" values="0.2;0.7;0.2" dur="2.5s" repeatCount="indefinite" />
                </line>
                <line x1="88" y1="200" x2="192" y2="175" stroke="#60A5FA" strokeWidth="2" opacity="0.7">
                  <animate attributeName="opacity" values="0.4;0.9;0.4" dur="1.8s" repeatCount="indefinite" />
                </line>
                <line x1="208" y1="125" x2="312" y2="125" stroke="#60A5FA" strokeWidth="2" opacity="0.8">
                  <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.2s" repeatCount="indefinite" />
                </line>
                <line x1="208" y1="175" x2="312" y2="175" stroke="#60A5FA" strokeWidth="2" opacity="0.6">
                  <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.8s" repeatCount="indefinite" />
                </line>
              </g>
              
              {/* Animated nodes */}
              <g filter="url(#glow)">
                <circle cx="80" cy="100" r="8" fill="url(#nodeGradient)">
                  <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="80" cy="150" r="8" fill="url(#nodeGradient)">
                  <animate attributeName="r" values="8;12;8" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="80" cy="200" r="8" fill="url(#nodeGradient)">
                  <animate attributeName="r" values="7;11;7" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="200" cy="125" r="8" fill="url(#nodeGradient)">
                  <animate attributeName="r" values="6;10;6" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="200" cy="175" r="8" fill="url(#nodeGradient)">
                  <animate attributeName="r" values="8;12;8" dur="2.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="320" cy="125" r="8" fill="url(#nodeGradient)">
                  <animate attributeName="r" values="7;11;7" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="320" cy="175" r="8" fill="url(#nodeGradient)">
                  <animate attributeName="r" values="6;10;6" dur="2.3s" repeatCount="indefinite" />
                </circle>
              </g>
            </svg>
          </div>
          
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg"
          >
            {isPlaying ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Video Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center space-x-4">
          <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          
          <button className="text-white hover:text-blue-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M6.343 6.343a9 9 0 000 12.728m2.829-9.9a5 5 0 000 7.072" />
            </svg>
          </button>
          
          <div className="flex-1 mx-4">
            <div className="bg-slate-600 h-1 rounded-full cursor-pointer">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          <span className="text-sm text-white font-mono">{currentTime} / {duration}</span>
          
          <button className="text-white hover:text-blue-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          <button className="text-white hover:text-blue-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Loading indicator when playing */}
      {isPlaying && (
        <div className="absolute top-4 right-4">
          <div className="flex items-center space-x-2 bg-black/50 rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white text-xs">LIVE</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
