import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, side = 'right', delay = 200 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Position classes
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  return (
    <div className="relative flex items-center" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {isVisible && (
        <div className={`absolute z-50 px-2 py-1 text-xs font-bold text-white bg-slate-900 dark:bg-slate-700 rounded-lg shadow-xl whitespace-nowrap animate-fade-in pointer-events-none ${positionClasses[side]}`}>
          {content}
          {/* Arrow */}
          <div className={`absolute w-2 h-2 bg-slate-900 dark:bg-slate-700 transform rotate-45 
            ${side === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
            ${side === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
            ${side === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
            ${side === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
          `}></div>
        </div>
      )}
    </div>
  );
};
