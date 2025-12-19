
import React from 'react';

interface CyberCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'cyan' | 'magenta' | 'yellow';
  statusIndicator?: 'INFO' | 'WARNING' | 'DANGER';
}

const CyberCard: React.FC<CyberCardProps> = ({ 
  title, 
  subtitle, 
  children, 
  className = '', 
  variant = 'cyan',
  statusIndicator 
}) => {
  const borderColor = {
    cyan: 'border-cyan-500 shadow-[0_0_10px_rgba(0,243,255,0.3)]',
    magenta: 'border-pink-500 shadow-[0_0_10px_rgba(255,0,255,0.3)]',
    yellow: 'border-yellow-500 shadow-[0_0_10px_rgba(255,255,0,0.3)]'
  }[variant];

  const titleColor = {
    cyan: 'text-cyan-400',
    magenta: 'text-pink-400',
    yellow: 'text-yellow-400'
  }[variant];

  const getIndicatorColor = () => {
    if (statusIndicator === 'DANGER') return 'bg-red-500 shadow-[0_0_8px_#ef4444]';
    if (statusIndicator === 'WARNING') return 'bg-yellow-500 shadow-[0_0_8px_#eab308]';
    if (statusIndicator === 'INFO') return 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]';
    
    // Fallback to variant color if statusIndicator not provided
    return {
      cyan: 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]',
      magenta: 'bg-pink-500 shadow-[0_0_8px_#ec4899]',
      yellow: 'bg-yellow-500 shadow-[0_0_8px_#eab308]'
    }[variant];
  };

  return (
    <div className={`glass-panel border-l-4 p-4 rounded-sm relative overflow-hidden transition-all duration-300 hover:bg-black/90 group ${borderColor} ${className}`}>
      {/* Glitch Overlay Effect */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity"></div>
      
      {title && (
        <div className="flex justify-between items-start mb-3 border-b border-white/10 pb-2">
          <div>
            <h3 className={`font-orbitron font-bold text-xs uppercase tracking-widest ${titleColor}`}>
              {title}
            </h3>
            {subtitle && <p className="text-[10px] text-white/40 uppercase mt-1">{subtitle}</p>}
          </div>
          <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${getIndicatorColor()}`}></div>
        </div>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Corner Accents */}
      <div className={`absolute top-0 right-0 w-4 h-1 ${variant === 'cyan' ? 'bg-cyan-500' : variant === 'magenta' ? 'bg-pink-500' : 'bg-yellow-500'}`}></div>
      <div className={`absolute bottom-0 left-0 w-1 h-4 ${variant === 'cyan' ? 'bg-cyan-500' : variant === 'magenta' ? 'bg-pink-500' : 'bg-yellow-500'}`}></div>
    </div>
  );
};

export default CyberCard;
