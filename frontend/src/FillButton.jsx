import React, { useState, useEffect } from 'react';

const FillButton = ({ onFilled, text }) => {
  const [fillPercent, setFillPercent] = useState(0);
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const [hasFilled, setHasFilled] = useState(false);
  const fillSpeed = 5; // Control the speed of fill
  const drainSpeed = 15; // Control the speed of drain

  useEffect(() => {
    const fillInterval = setInterval(() => {
      if (isSpaceDown) {
        setFillPercent((prev) => {
          const nextFillPercent = prev + fillSpeed;
          if (nextFillPercent >= 100 && !hasFilled) {
            onFilled();
            setHasFilled(true);
          }
          return Math.min(nextFillPercent, 100);
        });
      } else {
        setFillPercent((prev) => {
          const nextFillPercent = prev - drainSpeed;
          if (nextFillPercent <= 0) {
            setHasFilled(false);
          }
          return Math.max(0, nextFillPercent);
        });
      }
    }, 100);

    return () => clearInterval(fillInterval);
  }, [isSpaceDown, hasFilled]);

  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.code === 'Space') {
        setIsSpaceDown(true);
      }
    };

    const handleKeyup = (event) => {
      if (event.code === 'Space') {
        setIsSpaceDown(false);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyup);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('keyup', handleKeyup);
    };
  }, []);

  return (
    <div className="w-full h-12 border-2 border-gray-200 relative overflow-hidden rounded-md">
      <div
        style={{ width: `${fillPercent}%` }}
        className="absolute top-0 left-0 h-full bg-emerald-500/70 transition-width"
      />
      <div className="absolute inset-0 flex items-center justify-center cursor-default">
        <span className="text-xl text-black/50">{text}</span>
      </div>
    </div>
  );
};

export default FillButton;
