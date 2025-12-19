
import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus } from '../types.ts';
import { TRACK_PATH, STATUS_PROGRESS_MAP } from '../constants.ts';

interface TrackMapProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
}

const TrackMap: React.FC<TrackMapProps> = ({ tickets, onTicketClick }) => {
  return (
    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center bg-[#050505] rounded-xl border border-white/5 overflow-hidden shadow-inner">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(#00f3ff 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>

      {/* Inject custom animations for the track map */}
      <style>{`
        @keyframes rattle {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(0.5px, 0.5px) rotate(0.5deg); }
          50% { transform: translate(-0.5px, -0.5px) rotate(-0.5deg); }
          75% { transform: translate(-0.5px, 0.5px) rotate(0.5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .animate-rattle {
          animation: rattle 0.4s infinite linear;
        }
        @keyframes smoke-rise {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          50% { opacity: 0.6; }
          100% { opacity: 0; transform: translateY(-10px) scale(1.5); }
        }
      `}</style>

      <svg 
        viewBox="0 0 800 600" 
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full max-w-5xl max-h-full drop-shadow-[0_0_20px_rgba(0,243,255,0.2)]"
      >
        <defs>
          <filter id="spark-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* The Track Base */}
        <path
          id="race-track"
          d={TRACK_PATH}
          fill="none"
          stroke="rgba(0, 243, 255, 0.05)"
          strokeWidth="40"
          strokeLinecap="round"
        />
        
        {/* The Neon Line */}
        <path
          d={TRACK_PATH}
          fill="none"
          stroke="#00f3ff"
          strokeWidth="1.5"
          className="animate-[dash_15s_linear_infinite]"
          style={{ strokeDasharray: '30, 20', opacity: 0.6 }}
        />

        {/* Drift Particles / Sparks */}
        {[...Array(8)].map((_, i) => (
          <circle key={`spark-${i}`} r="1.5" fill="#00f3ff" filter="url(#spark-glow)">
            <animateMotion
              dur={`${12 + i * 2}s`}
              repeatCount="indefinite"
              path={TRACK_PATH}
              begin={`${i * 2}s`}
            />
            <animate
              attributeName="opacity"
              values="0;0.8;0"
              dur={`${12 + i * 2}s`}
              repeatCount="indefinite"
              begin={`${i * 2}s`}
            />
          </circle>
        ))}

        {/* Sector Labels - Adjusted visibility for scaling */}
        <text x="50" y="320" className="fill-white/20 text-[10px] font-orbitron uppercase tracking-widest hidden sm:block">The Grid</text>
        <text x="380" y="150" className="fill-white/20 text-[10px] font-orbitron uppercase tracking-widest hidden sm:block">Sector 1</text>
        <text x="680" y="320" className="fill-white/20 text-[10px] font-orbitron uppercase tracking-widest hidden sm:block">The Pit Lane</text>
        <text x="400" y="550" className="fill-white/20 text-[10px] font-orbitron uppercase tracking-widest hidden sm:block">Sector 2</text>

        {/* Render Tickets as "Cars" */}
        {tickets.map((ticket) => {
          const progress = STATUS_PROGRESS_MAP[ticket.status];
          const isBlocked = ticket.isBlocked;
          const isAging = ticket.ageDays > 7 && ticket.status !== TicketStatus.DONE;
          
          // Color Logic: Blocked (Yellow) > Aging (Orange) > Done (Green) > Standard (Magenta)
          let carColor = '#ff00ff';
          if (isBlocked) carColor = '#ffff00';
          else if (ticket.status === TicketStatus.DONE) carColor = '#00ff00';
          else if (isAging) carColor = '#ff5500'; // Neon Orange for aging

          return (
            <TicketCar 
              key={ticket.id} 
              progress={progress} 
              ticket={ticket} 
              color={carColor}
              isAging={isAging}
              onClick={() => onTicketClick(ticket)}
            />
          );
        })}
      </svg>
      
      {/* HUD Info Overlay - Responsive layout */}
      <div className="absolute bottom-2 left-2 right-2 flex flex-wrap justify-center sm:justify-start gap-3 md:gap-4 text-[7px] md:text-[9px] font-orbitron font-bold p-2 glass-panel border-none sm:bg-transparent">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#00ff00] shadow-[0_0_5px_#00ff00]"></div> DONE</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#ff00ff] shadow-[0_0_5px_#ff00ff]"></div> ACTIVE</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#ffff00] shadow-[0_0_5px_#ffff00]"></div> BLOCKED</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#ff5500] shadow-[0_0_5px_#ff5500]"></div> OVERHEATING (&gt;7d)</div>
      </div>
    </div>
  );
};

const TicketCar: React.FC<{ progress: number, ticket: Ticket, color: string, isAging: boolean, onClick: () => void }> = ({ progress, ticket, color, isAging, onClick }) => {
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const mainPath = document.getElementById('race-track') as unknown as SVGPathElement | null;
    if (mainPath) {
      const length = mainPath.getTotalLength();
      const { x, y } = mainPath.getPointAtLength(length * progress);
      setPoint({ x, y });
    }
  }, [progress]);

  // Urgency logic for age labeling
  const showAgeBadge = ticket.ageDays > 5;
  const ageBadgeColor = ticket.ageDays > 10 ? '#ef4444' : '#eab308';

  return (
    <g 
      className="cursor-pointer transition-all duration-300"
      transform={`translate(${point.x}, ${point.y})`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <g transform={`scale(${isHovered ? 1.6 : 1})`} className={isAging ? "animate-rattle" : ""}>
        {/* Glow Aura */}
        <circle 
          r={isHovered ? 16 : 10} 
          fill={color} 
          className={`transition-all duration-500 ${ticket.isBlocked ? 'animate-ping' : ''}`}
          style={{ opacity: isHovered ? 0.5 : 0.15 }}
        />
        
        {/* Aging Indicator: Dashed Ring & Smoke Effect */}
        {isAging && !ticket.isBlocked && (
          <>
            <circle 
              r="8" 
              fill="none" 
              stroke={color} 
              strokeWidth="1" 
              strokeDasharray="2,2"
              className="animate-[spin_4s_linear_infinite]"
              opacity="0.8"
            />
          </>
        )}
        
        {/* Main Car Core */}
        <circle 
          r="6" 
          fill={color} 
          className="transition-all duration-300 shadow-xl"
          style={{ filter: isHovered ? `drop-shadow(0 0 10px ${color})` : `drop-shadow(0 0 3px ${color}80)` }}
        />
        
        {/* Blocked Marker */}
        {ticket.isBlocked && (
          <path 
            d="M 0 -15 L 8 -10 L 0 -5 Z" 
            fill="#ffff00" 
            stroke="#000" 
            strokeWidth="0.5"
            className="animate-bounce"
          />
        )}
      </g>
      
      {/* Age Badge */}
      {showAgeBadge && (
        <g transform="translate(15, -15)">
          <rect width="20" height="12" rx="2" fill={ageBadgeColor} className="shadow-lg" />
          <text 
            x="10" 
            y="9" 
            textAnchor="middle" 
            className="fill-black font-black font-orbitron text-[8px]"
          >
            {ticket.ageDays}d
          </text>
        </g>
      )}
      
      {/* Key Label */}
      <text 
        y="25" 
        textAnchor="middle" 
        className="fill-white text-[9px] font-black font-orbitron"
        style={{ textShadow: '0 0 4px rgba(0,0,0,1)' }}
      >
        {ticket.key}
      </text>
    </g>
  );
};

export default TrackMap;
