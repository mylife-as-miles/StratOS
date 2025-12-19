
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
    <div className="h-32 w-full flex flex-col items-center justify-center relative">
      <div className="w-full h-full absolute inset-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={45}
              outerRadius={60}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={1000}
            >
              <Cell fill={color} />
              <Cell fill="rgba(255,255,255,0.05)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="relative flex flex-col items-center z-10 pointer-events-none mt-4">
        <span className="text-xl font-orbitron font-black text-white">{value}{unit}</span>
        <span className="text-[10px] uppercase text-white/40 tracking-widest">{label}</span>
      </div>
    </div>
  );
};

export const RPMGauge: React.FC<{ velocity: number }> = ({ velocity }) => {
  const bars = Array.from({ length: 20 });
  const activeCount = Math.floor((velocity / 100) * 20);

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex gap-1 h-4 w-full">
        {bars.map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 transition-all duration-500 ${
              i < activeCount 
                ? (i > 15 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-cyan-500 shadow-[0_0_10px_#00f3ff]')
                : 'bg-white/5'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] font-orbitron uppercase text-white/40">
        <span>Idle</span>
        <span>Velocity: {velocity} pts/day</span>
        <span>Rev Limit</span>
      </div>
    </div>
  );
};
