
import React from 'react';

interface CyberCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'cyan' | 'magenta' | 'yellow';
  statusIndicator?: 'INFO' | 'WARNING' | 'DANGER';
  avatarUrl?: string;
}

const CyberCard: React.FC<CyberCardProps> = ({ 
  title, 
  subtitle, 
  children, 
  className = '', 
  variant = 'cyan',
  statusIndicator,
  avatarUrl
}) => {
  const borderColor = {
    cyan: 'border-cyan-500 shadow-[0_0_15px_rgba(0,243,255,0.2)] hover:shadow-[0_0_35px_rgba(0,243,255,0.4)]',
    magenta: 'border-pink-500 shadow-[0_0_15px_rgba(255,0,255,0.2)] hover:shadow-[0_0_35px_rgba(255,0,255,0.4)]',
    yellow: 'border-yellow-500 shadow-[0_0_15px_rgba(255,255,0,0.2)] hover:shadow-[0_0_35px_rgba(255,255,0,0.4)]'
  }[variant];

  const titleColor = {
    cyan: 'text-cyan-400',
    magenta: 'text-pink-400',
    yellow: 'text-yellow-400'
  }[variant];

  const getIndicatorColor = () => {
    switch (statusIndicator) {
      case 'DANGER': return 'bg-red-500 shadow-[0_0_10px_#ef4444]';
      case 'WARNING': return 'bg-yellow-500 shadow-[0_0_10px_#eab308]';
      case 'INFO': return 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]';
      default: return 'bg-transparent';
    }
  };

  return (
    <div className={`glass-panel border-l-4 p-4 rounded-sm relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:bg-black/95 group ${borderColor} ${className}`}>
      {/* Glitch Overlay Effect */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity"></div>
      
      {title && (
        <div className="flex justify-between items-start mb-3 border-b border-white/10 pb-2">
          <div className="flex gap-3 items-center">
            {avatarUrl && (
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 shadow-inner flex-shrink-0">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h3 className={`font-orbitron font-bold text-xs uppercase tracking-widest ${titleColor}`}>
                {title}
              </h3>
              {subtitle && <p className="text-[10px] text-white/40 uppercase mt-0.5 font-mono">{subtitle}</p>}
            </div>
          </div>
          {statusIndicator && (
            <div className={`w-2 h-2 rounded-full animate-pulse mt-1 ${getIndicatorColor()}`}></div>
          )}
        </div>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Corner Accents */}
      <div className={`absolute top-0 right-0 w-4 h-0.5 ${variant === 'cyan' ? 'bg-cyan-500' : variant === 'magenta' ? 'bg-pink-500' : 'bg-yellow-500'}`}></div>
      <div className={`absolute bottom-0 left-0 w-0.5 h-4 ${variant === 'cyan' ? 'bg-cyan-500' : variant === 'magenta' ? 'bg-pink-500' : 'bg-yellow-500'}`}></div>
    </div>
  );
};

export default CyberCard;
