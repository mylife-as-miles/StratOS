
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Ticket, RaceTelemetry, AIStrategy, TicketStatus } from './types.ts';
import { MOCK_TICKETS } from './constants.ts';
import CyberCard from './components/CyberCard.tsx';
import TrackMap from './components/TrackMap.tsx';
import { FuelGauge, RPMGauge } from './components/Gauges.tsx';
import { getRaceStrategy } from './services/geminiService.ts';
import { MockTelemetrySocket } from './services/telemetrySocket.ts';
import DataExport from './components/DataExport.tsx';

type FilterType = 'All' | 'Blocked' | 'In Progress' | 'Done';

const App: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [strategy, setStrategy] = useState<AIStrategy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filter, setFilter] = useState<FilterType>('All');
  const [isLive, setIsLive] = useState(true);
  const [logs, setLogs] = useState<{ id: number; msg: string; type: 'info' | 'warn' | 'error'; time: string }[]>([]);
  
  // Network Stats
  const [netStats, setNetStats] = useState({ ping: 0, packetLoss: 0, connected: false });
  
  const logIdCounter = useRef(0);
  const socketRef = useRef<MockTelemetrySocket | null>(null);

  const addLog = (msg: string, type: 'info' | 'warn' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ id: logIdCounter.current++, msg, type, time }, ...prev].slice(0, 15));
  };

  // Initialize Socket Connection
  useEffect(() => {
    // Instantiate socket service
    const socket = new MockTelemetrySocket(MOCK_TICKETS);
    socketRef.current = socket;

    // Subscriptions
    socket.onData((newTickets) => {
      setTickets(newTickets);
    });

    socket.onLog((msg, type) => {
      addLog(msg, type);
    });

    socket.onStats((stats) => {
      setNetStats(stats);
    });

    // Initial Connect
    if (isLive) {
      socket.connect();
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  // Handle Live/Pause toggle
  useEffect(() => {
    if (!socketRef.current) return;
    
    if (isLive) {
      socketRef.current.connect();
    } else {
      socketRef.current.disconnect();
      addLog("SIMULATION PAUSED BY USER", 'warn');
    }
  }, [isLive]);

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
    const oldest = Math.max(...tickets.map(t => t.ageDays), 0);
    
    return {
      fuelLevel: Math.round((done / total) * 100),
      avgLapTime: 4.2,
      drsEnabled: done >= 2,
      tyreWear: Math.min(100, Math.round((oldest / 14) * 100)),
      yellowFlags: blocked
    };
  }, [tickets]);

  // Update AI strategy when tickets change, but debounce it to save API calls
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsLoading(true);
      const res = await getRaceStrategy(tickets);
      setStrategy(res);
      setIsLoading(false);
      addLog("AI STRATEGY RE-CALCULATED BY ROVO AGENT", 'info');
    }, 15000); 

    return () => clearTimeout(timer);
  }, [tickets]);

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const strategyVariant = strategy?.priorityLevel === 'CRITICAL' ? 'magenta' : 'cyan';
  const strategyBg = strategy?.priorityLevel === 'CRITICAL' 
    ? 'bg-pink-900/20 border-pink-500/40' 
    : 'bg-cyan-900/10 border-cyan-500/30';

  const filterConfigs = [
    { type: 'All', tooltip: 'Show all session telemetry' },
    { type: 'Blocked', tooltip: 'Show critical failures' },
    { type: 'In Progress', tooltip: 'Show cars in sectors' },
    { type: 'Done', tooltip: 'Show finished tickets' },
  ] as { type: FilterType, tooltip: string }[];

  return (
    <div className="min-h-screen md:h-screen w-full flex flex-col p-2 md:p-4 gap-4 bg-[#020202] text-cyan-50 selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      {/* Top Header Bar */}
      <header className="flex flex-col sm:flex-row justify-between items-center border-b border-cyan-900 pb-2 flex-shrink-0 gap-3">
        <div className="flex items-center gap-3 md:gap-4">
          <h1 className="font-orbitron text-xl md:text-2xl font-black tracking-tighter neon-text-cyan">
            STRAT<span className="text-white">OS</span>
          </h1>
          <div className="px-2 py-1 bg-cyan-900/30 border border-cyan-500 text-[9px] md:text-[10px] font-bold rounded flex items-center gap-2">
            PIT WALL v2.5.4
            {netStats.connected && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span>}
            {!netStats.connected && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></span>}
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-8 text-[10px] md:text-xs font-orbitron">
          <button 
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1 border font-bold uppercase tracking-widest transition-all ${isLive ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-cyan-500/10 border-cyan-500 text-cyan-400'}`}
          >
            {isLive ? 'LIVE TELEMETRY' : 'PAUSED'}
          </button>
          <div className="hidden sm:flex flex-col items-center sm:items-end">
            <span className="text-white/40 uppercase text-[8px]">Session Time</span>
            <span className="text-cyan-400 font-mono">00:42:15.892</span>
          </div>
          <div className="hidden sm:flex flex-col items-center sm:items-end">
            <span className="text-white/40 uppercase text-[8px]">Circuit</span>
            <span className="text-cyan-400">CLOUD-SPRINT-04</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-4 overflow-y-auto md:overflow-hidden min-h-0 custom-scrollbar">
        
        {/* Left Column: Telemetry & Widgets */}
        <aside className="order-2 md:order-1 col-span-12 md:col-span-3 flex flex-col gap-4 overflow-y-auto md:pr-2 custom-scrollbar">
          <CyberCard title="Fuel Load" subtitle="Sprint Burndown" variant="cyan">
            <FuelGauge value={telemetry.fuelLevel} label="Remaining" unit="%" />
          </CyberCard>

          <CyberCard title="Tyre Degradation" subtitle="Avg Ticket Age" variant={telemetry.tyreWear > 70 ? 'magenta' : 'cyan'}>
            <div className="flex items-end gap-2 mb-2">
              <span className={`text-2xl md:text-3xl font-orbitron font-bold ${telemetry.tyreWear > 70 ? 'text-pink-500' : 'text-white'}`}>
                {telemetry.tyreWear}%
              </span>
              <span className="text-[9px] md:text-[10px] text-white/40 mb-1 uppercase">Wear Rating</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${telemetry.tyreWear > 70 ? 'bg-pink-500' : 'bg-cyan-500'}`} 
                style={{ width: `${telemetry.tyreWear}%` }}
              ></div>
            </div>
            <p className="text-[9px] md:text-[10px] mt-2 text-white/60 italic leading-tight">
              {telemetry.tyreWear > 60 ? "BOX BOX BOX! High tech debt." : "Tyres holding. Performance optimal."}
            </p>
          </CyberCard>

          <div className="hidden md:block">
            <CyberCard title="Engine Performance" subtitle="Team Velocity" variant="cyan">
              <RPMGauge velocity={85} />
            </CyberCard>
          </div>

          {telemetry.yellowFlags > 0 && (
            <div className="bg-yellow-500/10 border-2 border-yellow-500 p-2 text-center animate-pulse flex-shrink-0">
              <span className="font-orbitron font-black text-yellow-500 tracking-widest text-sm md:text-lg">YELLOW FLAG</span>
            </div>
          )}
        </aside>

        {/* Center Column: The Track */}
        <main className="order-1 md:order-2 col-span-12 md:col-span-6 flex flex-col gap-4 relative min-h-0 md:overflow-y-auto md:pr-1 custom-scrollbar">
          <div className="flex items-center gap-2 mb-1 p-1 glass-panel rounded-sm border-cyan-900/30 bg-black/40 flex-shrink-0 overflow-x-auto custom-scrollbar whitespace-nowrap">
            {filterConfigs.map(({ type, tooltip }) => (
              <div key={type} className="relative group/tooltip flex-shrink-0">
                <button
                  onClick={() => setFilter(type)}
                  className={`px-3 md:px-4 py-1 text-[9px] md:text-[10px] font-orbitron uppercase border transition-all duration-200 ${
                    filter === type 
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_#00f3ff]' 
                    : 'bg-transparent text-cyan-500 border-cyan-900 hover:border-cyan-500 hover:bg-cyan-500/5'
                  }`}
                >
                  {type}
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 border border-cyan-500/50 text-[8px] text-cyan-400 uppercase tracking-widest opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity duration-200 z-50 whitespace-nowrap font-bold shadow-lg hidden sm:block">
                  {tooltip}
                </div>
              </div>
            ))}
            
            <div className="w-[1px] h-6 bg-white/10 mx-2"></div>
            
            {/* NEW: Data Export Component */}
            <DataExport tickets={tickets} />
            
            <div className="flex-1 hidden sm:block"></div>
            <div className="text-[8px] md:text-[9px] font-orbitron text-white/20 uppercase tracking-widest mr-2 hidden sm:block">
              Telemetric Overlay
            </div>
          </div>

          <div className="flex-1 min-h-[300px] md:min-h-0">
            <TrackMap tickets={filteredTickets} onTicketClick={handleTicketClick} />
          </div>
          
          {selectedTicket && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-12 overflow-y-auto custom-scrollbar">
              <CyberCard 
                title={selectedTicket.key} 
                subtitle={selectedTicket.assignee} 
                className="w-full max-w-lg max-h-[90vh] flex flex-col"
                variant={selectedTicket.isBlocked ? 'yellow' : 'cyan'}
                statusIndicator={selectedTicket.isBlocked ? 'WARNING' : selectedTicket.status === TicketStatus.DONE ? 'INFO' : 'INFO'}
              >
                <div className="overflow-y-auto max-h-[60vh] md:max-h-none pr-1 custom-scrollbar">
                  <h2 className="text-lg md:text-xl font-orbitron font-bold mb-4">{selectedTicket.summary}</h2>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-2 border border-white/5 bg-white/5 rounded">
                      <span className="block text-white/40 uppercase text-[8px] mb-1">Status</span>
                      <span className="font-bold">{selectedTicket.status}</span>
                    </div>
                    <div className="p-2 border border-white/5 bg-white/5 rounded">
                      <span className="block text-white/40 uppercase text-[8px] mb-1">Age</span>
                      <span className="font-bold">{selectedTicket.ageDays} Days</span>
                    </div>
                    <div className="p-2 border border-white/5 bg-white/5 rounded">
                      <span className="block text-white/40 uppercase text-[8px] mb-1">Story Points</span>
                      <span className="font-bold">{selectedTicket.points} pts</span>
                    </div>
                    <div className="p-2 border border-white/5 bg-white/5 rounded">
                      <span className="block text-white/40 uppercase text-[8px] mb-1">Condition</span>
                      <span className={`font-bold ${selectedTicket.isBlocked ? 'text-yellow-500' : 'text-green-500'}`}>
                        {selectedTicket.isBlocked ? 'BLOCKAGE' : 'OPTIMAL'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 border border-cyan-500/10 bg-black/40 rounded text-[10px] leading-relaxed opacity-70 italic">
                    Telemetric diagnostic data stream encrypted. Target assigned to {selectedTicket.assignee} for immediate resolution in Sector 1.
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="mt-6 w-full py-3 border border-cyan-500/30 hover:bg-cyan-500/10 font-orbitron text-xs uppercase transition-colors text-cyan-400 tracking-widest flex-shrink-0"
                >
                  Close Telemetry
                </button>
              </CyberCard>
            </div>
          )}

          {/* Team Radio Logs */}
          <div className="glass-panel border-t-2 border-cyan-500 p-2 md:p-3 h-24 md:h-32 overflow-y-auto custom-scrollbar flex-shrink-0">
            <h4 className="font-orbitron text-[8px] md:text-[10px] text-cyan-400 mb-1 md:mb-2 uppercase tracking-widest">Team Radio / Live Feed</h4>
            <div className="space-y-1 text-[9px] md:text-[10px] font-mono">
              {!netStats.connected && logs.length === 0 && <p className="opacity-40 italic">Awaiting telemetry signal...</p>}
              {logs.map(log => (
                <p key={log.id} className={log.type === 'warn' ? 'text-yellow-500 animate-pulse' : log.type === 'error' ? 'text-red-500 font-bold' : 'text-cyan-50/80'}>
                  <span className="text-cyan-500/60 font-bold mr-2">[{log.time}]</span>
                  {log.msg}
                </p>
              ))}
            </div>
          </div>
        </main>

        {/* Right Column */}
        <aside className="order-3 md:order-3 col-span-12 md:col-span-3 flex flex-col gap-4 overflow-y-auto md:pl-2 custom-scrollbar">
          {!strategy && !isLoading ? (
            <CyberCard 
              title="Race Strategy" 
              subtitle="Critical Failure" 
              variant="magenta"
              className="border-pink-600 bg-pink-950/20 animate-pulse"
              statusIndicator="DANGER"
            >
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="text-pink-500 text-2xl md:text-3xl font-black font-orbitron">SYSTEM OFFLINE</div>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 border border-pink-500 text-[10px] uppercase font-orbitron hover:bg-pink-500 hover:text-white transition-colors"
                >
                  Manual Re-Sync
                </button>
              </div>
            </CyberCard>
          ) : (
            <CyberCard 
              title="Race Strategy" 
              subtitle="Rovo Agent Analysis" 
              variant={strategyVariant}
              avatarUrl="https://api.dicebear.com/7.x/bottts/svg?seed=Rovo&backgroundColor=050505"
              className={`${strategyBg} transition-all duration-700`}
              statusIndicator={isLoading ? 'INFO' : (strategy?.priorityLevel === 'CRITICAL' ? 'DANGER' : 'INFO')}
            >
              {isLoading ? (
                <div className="flex flex-col items-center py-6 md:py-10">
                  <div className="relative w-12 h-12 md:w-16 md:h-16">
                     <div className="absolute inset-0 border-2 border-cyan-500/10 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <span className="text-[10px] md:text-[11px] mt-4 font-orbitron animate-pulse text-cyan-400 tracking-widest font-bold uppercase">Processing...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[10px] md:text-[11px] leading-relaxed text-white/80 border-l-2 border-cyan-500/30 pl-2 font-mono">
                    {strategy?.analysis}
                  </p>
                  <div>
                    <h5 className="text-[9px] md:text-[10px] font-orbitron uppercase text-cyan-400 mb-2 tracking-tighter">Strategic Pit Instructions:</h5>
                    <ul className="space-y-2">
                      {strategy?.recommendations.map((rec, i) => (
                        <li key={i} className="text-[9px] md:text-[10px] flex gap-2 items-start">
                          <span className="text-cyan-500">▶</span>
                          <span className="text-white/60 leading-tight italic">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`text-[10px] md:text-[11px] font-black p-2 text-center rounded bg-black/60 border ${
                    strategy?.priorityLevel === 'CRITICAL' 
                      ? 'border-pink-500 text-pink-500 shadow-lg' 
                      : 'border-cyan-500 text-cyan-400'
                  }`}>
                    STATUS: {strategy?.priorityLevel}
                  </div>
                </div>
              )}
            </CyberCard>
          )}

          <CyberCard title="Driver Standings" subtitle="Top Contributors" variant="cyan">
            <div className="space-y-2 md:space-y-3">
              {[
                { name: 'Max V.', pts: tickets.filter(t => t.assignee === 'Max V.' && t.status === TicketStatus.DONE).length * 10 + 25, color: 'text-white' },
                { name: 'Lewis H.', pts: tickets.filter(t => t.assignee === 'Lewis H.' && t.status === TicketStatus.DONE).length * 10 + 18, color: 'text-white/80' },
                { name: 'Lando N.', pts: tickets.filter(t => t.assignee === 'Lando N.' && t.status === TicketStatus.DONE).length * 10 + 15, color: 'text-white/60' },
                { name: 'Oscar P.', pts: tickets.filter(t => t.assignee === 'Oscar P.' && t.status === TicketStatus.DONE).length * 10 + 12, color: 'text-white/40' },
              ].sort((a,b) => b.pts - a.pts).map((driver, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] md:text-[11px] border-b border-white/5 pb-1 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-500 font-orbitron italic">P{i+1}</span>
                    <span className={driver.color}>{driver.name}</span>
                  </div>
                  <span className="font-orbitron tabular-nums tracking-tighter">{driver.pts}pts</span>
                </div>
              ))}
            </div>
          </CyberCard>
        </aside>
      </div>

      <footer className="h-auto md:h-6 py-2 md:py-0 flex flex-col md:flex-row justify-between items-center text-[7px] md:text-[8px] font-orbitron text-white/20 uppercase tracking-[0.2em] flex-shrink-0 gap-2">
        <div className="flex items-center gap-4">
          <span>Uplink: <span className={netStats.connected ? "text-green-500 animate-pulse" : "text-red-500"}>{netStats.connected ? 'ACTIVE' : 'OFFLINE'}</span></span>
          <span className="hidden sm:inline">PING: <span className="text-cyan-400">{netStats.ping}ms</span></span>
          <span className="hidden sm:inline">LOSS: <span className={netStats.packetLoss > 0 ? "text-red-500 animate-pulse" : "text-cyan-400"}>{netStats.packetLoss.toFixed(1)}%</span></span>
        </div>
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          <span className={isLive ? 'text-green-500/40' : 'text-red-500/40'}>
            Simulation: {isLive ? 'Running' : 'Paused'}
          </span>
          <span className="hidden lg:inline">Runtime: v2.11.0</span>
        </div>
        <div className="text-center md:text-right">(C) 2024 StratOS Mission Control</div>
      </footer>
    </div>
  );
};

export default App;
