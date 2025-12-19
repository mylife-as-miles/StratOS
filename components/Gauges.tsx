
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface GaugeProps {
  value: number;
  label: string;
  unit?: string;
  color?: string;
  max?: number;
}

export const FuelGauge: React.FC<GaugeProps> = ({ value, label, unit = '%', color = '#00f3ff', max = 100 }) => {
  const data = [
    { value: value },
    { value: max - value }
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center relative rounded-lg p-2" style={{ height: '160px' }}>
      <div className="w-full h-full relative">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={data}
              cx="50%"
              cy="75%"
              startAngle={180}
              endAngle={0}
              innerRadius="70%"
              outerRadius="95%"
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              isAnimationActive={true}
              animationBegin={0}
              animationDuration={800}
            >
              <Cell fill={color} />
              <Cell fill="rgba(255,255,255,0.05)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Centered Stats Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none">
          <span className="text-3xl font-orbitron font-black text-white leading-none tracking-tighter">
            {value}<span className="text-sm ml-0.5 text-white/60">{unit}</span>
          </span>
          <span className="text-[10px] uppercase text-white/40 font-bold tracking-[0.2em] mt-2">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};

export const RPMGauge: React.FC<{ velocity: number }> = ({ velocity }) => {
  const bars = Array.from({ length: 20 });
  const activeCount = Math.floor((velocity / 100) * 20);

  return (
    <div className="flex flex-col gap-2 w-full p-3 bg-black/40 rounded border border-white/5">
      <div className="flex gap-1 h-6 w-full">
        {bars.map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 transition-all duration-700 rounded-sm ${
              i < activeCount 
                ? (i > 15 ? 'bg-red-500 shadow-[0_0_12px_#ef4444]' : 'bg-cyan-500 shadow-[0_0_12px_#00f3ff]')
                : 'bg-white/5'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] font-orbitron font-bold uppercase text-white/30 tracking-widest mt-1">
        <span>IDLE</span>
        <span className="text-cyan-400/80">VELOCITY: {velocity} P/D</span>
        <span>LIMIT</span>
      </div>
    </div>
  );
};
