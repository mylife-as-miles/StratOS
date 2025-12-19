
import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus } from '../types';
import { TRACK_PATH, STATUS_PROGRESS_MAP } from '../constants';

interface TrackMapProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
}

const TrackMap: React.FC<TrackMapProps> = ({ tickets, onTicketClick }) => {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center bg-[#050505] rounded-xl border border-white/5 overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(#00f3ff 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>

      <svg viewBox="0 0 800 600" className="w-full h-full max-w-4xl drop-shadow-[0_0_20px_rgba(0,243,255,0.2)]">
        {/* The Track Base */}
        <path
          id="race-track"
          d={TRACK_PATH}
          fill="none"
          stroke="rgba(0, 243, 255, 0.1)"
          strokeWidth="40"
          strokeLinecap="round"
        />
        
        {/* The Neon Line */}
        <path
          d={TRACK_PATH}
          fill="none"
          stroke="#00f3ff"
          strokeWidth="2"
          className="animate-[dash_10s_linear_infinite]"
          style={{ strokeDasharray: '20, 10' }}
        />

        {/* Sector Labels */}
        <text x="50" y="320" className="fill-white/30 text-[10px] font-orbitron uppercase tracking-tighter">The Grid</text>
        <text x="380" y="150" className="fill-white/30 text-[10px] font-orbitron uppercase tracking-tighter">Sector 1</text>
        <text x="680" y="320" className="fill-white/30 text-[10px] font-orbitron uppercase tracking-tighter">The Pit Lane</text>
        <text x="400" y="550" className="fill-white/30 text-[10px] font-orbitron uppercase tracking-tighter">Sector 2</text>

        {/* Render Tickets as "Cars" */}
        {tickets.map((ticket) => {
          const progress = STATUS_PROGRESS_MAP[ticket.status];
          const isBlocked = ticket.isBlocked;
          const carColor = isBlocked ? '#ffff00' : ticket.status === TicketStatus.DONE ? '#00ff00' : '#ff00ff';

          return (
            <TicketCar 
              key={ticket.id} 
              progress={progress} 
              ticket={ticket} 
              color={carColor}
              onClick={() => onTicketClick(ticket)}
            />
          );
        })}
      </svg>
      
      {/* HUD Info Overlay */}
      <div className="absolute bottom-4 left-4 flex gap-4 text-[10px] font-orbitron">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#00ff00]"></div> DONE</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#ff00ff]"></div> IN PROGRESS</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#ffff00]"></div> BLOCKED / YELLOW FLAG</div>
      </div>
    </div>
  );
};

const TicketCar: React.FC<{ progress: number, ticket: Ticket, color: string, onClick: () => void }> = ({ progress, ticket, color, onClick }) => {
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Cast via unknown to bypass HTMLElement -> SVGPathElement constraint
    const mainPath = document.getElementById('race-track') as unknown as SVGPathElement | null;
    if (mainPath) {
      const length = mainPath.getTotalLength();
      const { x, y } = mainPath.getPointAtLength(length * progress);
      setPoint({ x, y });
    }
  }, [progress]);

  // Color logic for age: Yellow for > 5 days, Red for > 10 days
  const ageLabelColor = ticket.ageDays > 10 ? '#ef4444' : '#eab308';
  const showAge = ticket.ageDays > 5;

  return (
    <g 
      className="cursor-pointer transition-all duration-300"
      transform={`translate(${point.x}, ${point.y}) scale(${isHovered ? 1.5 : 1})`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Halo / Glow - Proportional to hover and car color */}
      <circle 
        r={isHovered ? 18 : 12} 
        fill={color} 
        className={`transition-all duration-300 ${ticket.isBlocked ? 'animate-ping' : ''}`} 
        style={{ 
          opacity: isHovered ? 0.4 : 0.15,
          filter: isHovered ? `blur(4px)` : 'none'
        }} 
      />
      
      {/* Main Car Body */}
      <circle 
        r="6" 
        fill={color} 
        className="transition-all duration-300"
        style={{ filter: isHovered ? `drop-shadow(0 0 10px ${color})` : 'none' }}
      />
      
      {/* Yellow Flag Icon for blocked */}
      {ticket.isBlocked && (
        <path 
          d="M 0 -20 L 12 -14 L 0 -8 Z" 
          fill="#ffff00" 
          stroke="#000" 
          strokeWidth="1"
          className="animate-bounce"
        />
      )}
      
      {/* Age Badge - Positioned near the car */}
      {showAge && (
        <g transform="translate(12, -12)">
          <rect width="20" height="10" rx="2" fill={ageLabelColor} className="opacity-90 shadow-sm" />
          <text 
            x="10" 
            y="7.5" 
            textAnchor="middle" 
            className="fill-black font-bold font-orbitron text-[7px]"
          >
            {ticket.ageDays}d
          </text>
        </g>
      )}
      
      {/* Label */}
      <text 
        y="22" 
        textAnchor="middle" 
        className="fill-white text-[9px] font-bold font-orbitron"
        style={{ textShadow: '0 0 4px rgba(0,0,0,0.9)' }}
      >
        {ticket.key}
      </text>
    </g>
  );
};

export default TrackMap;
