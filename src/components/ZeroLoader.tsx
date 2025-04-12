import React from 'react';

interface ZeroLoaderProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  animationDuration?: number;
  isPlaying?: boolean;
  showControls?: boolean;
  onTogglePlay?: () => void;
}

const ZeroLoader: React.FC<ZeroLoaderProps> = ({
  width = 300,
  height = 100,
  backgroundColor = '#121212',
  strokeColor = 'white',
  strokeWidth = 4,
  animationDuration = 1.5,
  isPlaying = true,
  showControls = false,
  onTogglePlay
}) => {


  const handleTogglePlay = () => {
    if (onTogglePlay) {
      onTogglePlay();
    }
  };

  return (
    <div style={{ position: 'relative', width, height }}>
      <svg 
        viewBox="0 0 300 100" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        <style>
          {`
            @keyframes drawZero {
              0% {
                stroke-dashoffset: 600;
              }
              100% {
                stroke-dashoffset: 0;
              }
            }
            
            .zero-path {
              fill: none;
              stroke: ${strokeColor};
              stroke-width: ${strokeWidth};
              stroke-linecap: round;
              stroke-linejoin: round;
              stroke-dasharray: 600;
              stroke-dashoffset: ${isPlaying ? 'var(--animated-offset)' : '0'};
              animation: ${isPlaying ? `drawZero ${animationDuration}s linear infinite` : 'none'};
            }
            
            .zero-path {
              --animated-offset: 600;
            }
            
            .background {
              fill: ${backgroundColor};
            }
          `}
        </style>
        
        <rect className="background" x="0" y="0" width="300" height="100" />
        
        {/* Z */}
        <path className="zero-path" d="M 40,30 L 80,30 L 40,70 L 80,70" />
        
        {/* E */}
        <path className="zero-path" d="M 90,30 L 130,30 L 90,30 L 90,70 L 130,70 M 90,50 L 120,50" />
        
        {/* R */}
        <path className="zero-path" d="M 140,30 L 140,70 M 140,30 L 170,30 C 180,30 180,50 170,50 L 140,50 M 170,50 L 180,70" />
        
        {/* O */}
        <path className="zero-path" d="M 220,30 C 240,30 260,30 260,50 C 260,70 240,70 220,70 C 200,70 200,50 200,30 C 200,30 200,30 220,30 Z" />
      </svg>
      
      {showControls && (
        <button 
          onClick={handleTogglePlay}
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(255, 255, 255, 0.3)',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          {isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect x="2" y="2" width="3" height="8" fill={strokeColor} />
              <rect x="7" y="2" width="3" height="8" fill={strokeColor} />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <polygon points="3,2 10,6 3,10" fill={strokeColor} />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};

export default ZeroLoader;