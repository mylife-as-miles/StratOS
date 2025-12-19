
import React, { useState, useEffect, useMemo } from 'react';
import { Ticket, RaceTelemetry, AIStrategy, TicketStatus } from './types';
import { MOCK_TICKETS } from './constants';
import CyberCard from './components/CyberCard';
import TrackMap from './components/TrackMap';
import { FuelGauge, RPMGauge } from './components/Gauges';
import { getRaceStrategy } from './services/geminiService';

type FilterType = 'All' | 'Blocked' | 'In Progress' | 'Done';

const App: React.FC = () => {
  const [tickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [strategy, setStrategy] = useState<AIStrategy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filter, setFilter] = useState<FilterType>('All');

  // Filtered tickets logic for TrackMap - ensures re-render with the filtered list
  const filteredTickets = useMemo(() => {
    switch (filter) {
      case 'Blocked': return tickets.filter(t => t.isBlocked);
      case 'In Progress': return tickets.filter(t => t.status === TicketStatus.IN_PROGRESS);
      case 'Done': return tickets.filter(t => t.status === TicketStatus.DONE);
      default: return tickets;
    }
  }, [tickets, filter]);

  const telemetry = useMemo((): RaceTelemetry => {
    const done = tickets.filter(t => t.status === TicketStatus.DONE).length;
    const total = tickets.length;
    const blocked = tickets.filter(t => t.isBlocked).length;
    const oldest = Math.max(...tickets.map(t => t.ageDays));
    
    return {
      fuelLevel: Math.round((done / total) * 100),
      avgLapTime: 4.2,
      drsEnabled: done >= 2,
      tyreWear: Math.min(100, (oldest / 12) * 100),
      yellowFlags: blocked
    };
  }, [tickets]);

  useEffect(() => {
    const loadStrategy = async () => {
      setIsLoading(true);
      const res = await getRaceStrategy(tickets);
      setStrategy(res);
      setIsLoading(false);
    };
    loadStrategy();
  }, [tickets]);

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  // Visual logic for Race Strategy priority level
  const strategyVariant = strategy?.priorityLevel === 'CRITICAL' ? 'magenta' : 'cyan';
  const strategyBg = strategy?.priorityLevel === 'CRITICAL' 
    ? 'bg-pink-900/20 border-pink-500/40' 
    : 'bg-cyan-900/10 border-cyan-500/30';

  return (
    <div className="h-screen w-screen flex flex-col p-4 gap-4 bg-[#020202] text-cyan-50 selection:bg-cyan-500 selection:text-black">
      {/* Top Header Bar */}
      <header className="flex justify-between items-center border-b border-cyan-900 pb-2 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-orbitron text-2xl font-black tracking-tighter neon-text-cyan">
            STRAT<span className="text-white">OS</span>
          </h1>
          <div className="px-2 py-1 bg-cyan-900/30 border border-cyan-500 text-[10px] font-bold rounded">
            PIT WALL v2.5.4
          </div>
        </div>
        <div className="flex gap-8 text-xs font-orbitron">
          <div className="flex flex-col items-end">
            <span className="text-white/40 uppercase">Session Time</span>
            <span className="text-cyan-400">00:42:15.892</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-white/40 uppercase">Circuit</span>
            <span className="text-cyan-400">CLOUD-SPRINT-04</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden min-h-0">
        
        {/* Left Column: Telemetry & Widgets */}
        <aside className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex-shrink-0">
            <CyberCard title="Fuel Load" subtitle="Sprint Burndown" variant="cyan">
              <FuelGauge value={telemetry.fuelLevel} label="Remaining" unit="%" />
            </CyberCard>
          </div>

          <div className="flex-shrink-0">
            <CyberCard title="Tyre Degradation" subtitle="Avg Ticket Age" variant={telemetry.tyreWear > 70 ? 'magenta' : 'cyan'}>
              <div className="flex items-end gap-2 mb-2">
                <span className={`text-3xl font-orbitron font-bold ${telemetry.tyreWear > 70 ? 'text-pink-500' : 'text-white'}`}>
                  {telemetry.tyreWear}%
                </span>
                <span className="text-[10px] text-white/40 mb-1 uppercase">Wear Rating</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${telemetry.tyreWear > 70 ? 'bg-pink-500' : 'bg-cyan-500'}`} 
                  style={{ width: `${telemetry.tyreWear}%` }}
                ></div>
              </div>
              <p className="text-[10px] mt-2 text-white/60 italic leading-tight">
                {telemetry.tyreWear > 60 ? "BOX BOX BOX! Heavy technical debt detected." : "Tyres holding. Optimal performance maintained."}
              </p>
            </CyberCard>
          </div>

          <div className="flex-shrink-0">
            <CyberCard title="Engine Performance" subtitle="Team Velocity" variant="cyan">
              <RPMGauge velocity={85} />
            </CyberCard>
          </div>

          {telemetry.drsEnabled && (
            <div className="bg-green-500/10 border-2 border-green-500 p-2 text-center animate-pulse flex-shrink-0">
              <span className="font-orbitron font-black text-green-500 tracking-widest text-lg">DRS ENABLED</span>
            </div>
          )}
        </aside>

        {/* Center Column: The Track */}
        <main className="col-span-6 flex flex-col gap-4 relative min-h-0">
          {/* Filters Bar Above TrackMap */}
          <div className="flex items-center gap-2 mb-1 p-1 glass-panel rounded-sm border-cyan-900/30 bg-black/40 flex-shrink-0">
            {(['All', 'Blocked', 'In Progress', 'Done'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1 text-[10px] font-orbitron uppercase border transition-all duration-200 ${
                  filter === f 
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_#00f3ff]' 
                  : 'bg-transparent text-cyan-500 border-cyan-900 hover:border-cyan-500 hover:bg-cyan-500/5'
                }`}
              >
                {f}
              </button>
            ))}
            <div className="flex-1"></div>
            <div className="text-[9px] font-orbitron text-white/20 uppercase tracking-widest mr-2">
              Telemetric Overlay
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <TrackMap tickets={filteredTickets} onTicketClick={handleTicketClick} />
          </div>
          
          {/* Detailed Ticket Overlay */}
          {selectedTicket && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-12">
              <CyberCard 
                title={selectedTicket.key} 
                subtitle={selectedTicket.assignee} 
                className="w-full max-w-md"
                variant={selectedTicket.isBlocked ? 'yellow' : 'cyan'}
                statusIndicator={selectedTicket.isBlocked ? 'WARNING' : selectedTicket.status === TicketStatus.DONE ? 'INFO' : 'INFO'}
              >
                <h2 className="text-xl font-orbitron font-bold mb-4">{selectedTicket.summary}</h2>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-white/40 uppercase">Status</span>
                    <span className="font-bold">{selectedTicket.status}</span>
                  </div>
                  <div>
                    <span className="block text-white/40 uppercase">Age</span>
                    <span className="font-bold">{selectedTicket.ageDays} Days</span>
                  </div>
                  <div>
                    <span className="block text-white/40 uppercase">Story Points</span>
                    <span className="font-bold">{selectedTicket.points} pts</span>
                  </div>
                  <div>
                    <span className="block text-white/40 uppercase">Condition</span>
                    <span className={`font-bold ${selectedTicket.isBlocked ? 'text-yellow-500' : 'text-green-500'}`}>
                      {selectedTicket.isBlocked ? 'MECHANICAL FAILURE' : 'OPTIMAL'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="mt-6 w-full py-2 border border-white/20 hover:bg-white/10 font-orbitron text-[10px] uppercase transition-colors"
                >
                  Close Telemetry
                </button>
              </CyberCard>
            </div>
          )}

          {/* Bottom Feed: Live Comms */}
          <div className="glass-panel border-t-2 border-cyan-500 p-3 h-32 overflow-y-auto custom-scrollbar flex-shrink-0">
            <h4 className="font-orbitron text-[10px] text-cyan-400 mb-2 uppercase tracking-widest">Team Radio / Audit Logs</h4>
            <div className="space-y-1 text-[10px] font-mono">
              <p className="text-white/40"><span className="text-cyan-500">[08:12]</span> PIT_WALL: Sector 1 clear. Lando N. setting purple sectors.</p>
              <p className="text-white/40"><span className="text-cyan-500">[08:14]</span> PIT_WALL: Ticket ST-102 entering Pit Lane (QA Review).</p>
              <p className="text-yellow-500"><span className="text-yellow-500">[08:21]</span> RACE_CONTROL: YELLOW FLAG in Sector 2. Ticket ST-106 is blocked.</p>
              <p className="text-white/40"><span className="text-cyan-500">[08:25]</span> PIT_WALL: DRS Enabled for Team Velocity boost.</p>
            </div>
          </div>
        </main>

        {/* Right Column: AI Strategy & Leaderboard */}
        <aside className="col-span-3 flex flex-col gap-4 overflow-y-auto pl-2 custom-scrollbar">
          <div className="flex-shrink-0">
            <CyberCard 
              title="Race Strategy" 
              subtitle="Rovo Agent Analysis" 
              variant={strategyVariant}
              className={`${strategyBg} transition-all duration-700`}
              statusIndicator={isLoading ? 'INFO' : (strategy?.priorityLevel === 'CRITICAL' ? 'DANGER' : 'INFO')}
            >
              {isLoading ? (
                <div className="flex flex-col items-center py-10">
                  <div className="relative">
                     {/* Animated AI PROCESSING Icon */}
                     <div className="w-16 h-16 border-2 border-cyan-500/10 rounded-full"></div>
                     <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                     <div className="absolute inset-2 w-12 h-12 border-b-2 border-magenta-500 border-l-2 border-l-transparent rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                     <div className="absolute inset-5 w-6 h-6 bg-cyan-500/20 rounded-sm animate-pulse flex items-center justify-center">
                       <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                     </div>
                  </div>
                  <span className="text-[11px] mt-8 font-orbitron animate-pulse text-cyan-400 tracking-widest font-bold">AI PROCESSING TELEMETRY...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[11px] leading-relaxed text-white/80 border-l-2 border-cyan-500/30 pl-2">
                    {strategy?.analysis}
                  </p>
                  <div>
                    <h5 className="text-[10px] font-orbitron uppercase text-cyan-400 mb-2 tracking-tighter">Strategic Pit Instructions:</h5>
                    <ul className="space-y-2">
                      {strategy?.recommendations.map((rec, i) => (
                        <li key={i} className="text-[10px] flex gap-2 items-start group">
                          <span className="text-cyan-500 transition-transform group-hover:translate-x-1">▶</span>
                          <span className="text-white/60 leading-tight">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`text-[11px] font-black p-2 text-center rounded bg-black/60 border transition-all duration-700 ${
                    strategy?.priorityLevel === 'CRITICAL' 
                      ? 'border-pink-500 text-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.5)]' 
                      : 'border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                  }`}>
                    MISSION STATUS: {strategy?.priorityLevel}
                  </div>
                </div>
              )}
            </CyberCard>
          </div>

          <div className="flex-shrink-0">
            <CyberCard title="Driver Standings" subtitle="Top Contributors" variant="cyan">
              <div className="space-y-3">
                {[
                  { name: 'Max V.', pts: 42, color: 'text-white' },
                  { name: 'Lewis H.', pts: 38, color: 'text-white/80' },
                  { name: 'Lando N.', pts: 31, color: 'text-white/60' },
                  { name: 'Oscar P.', pts: 25, color: 'text-white/40' },
                ].map((driver, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px] border-b border-white/5 pb-1 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-500 font-orbitron italic w-4">P{i+1}</span>
                      <span className={driver.color}>{driver.name}</span>
                    </div>
                    <span className="font-orbitron tabular-nums tracking-tighter">{driver.pts}pts</span>
                  </div>
                ))}
              </div>
            </CyberCard>
          </div>
        </aside>
      </div>

      {/* Footer Footer Status */}
      <footer className="h-6 flex justify-between items-center text-[8px] font-orbitron text-white/20 uppercase tracking-[0.2em] flex-shrink-0">
        <div>Satellite Uplink: <span className="text-green-500 animate-pulse">Active</span></div>
        <div className="flex gap-4">
          <span>Packet Loss: 0.00%</span>
          <span>Jira-Cloud Sync: Synchronized</span>
          <span>Atlassian Forge Runtime: 2.11.0</span>
        </div>
        <div>(C) 2024 StratOS Mission Control</div>
      </footer>
    </div>
  );
};

export default App;
