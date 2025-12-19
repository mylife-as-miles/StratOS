
import React, { useState } from 'react';
import { Ticket, TicketStatus } from '../types.ts';

interface DataExportProps {
  tickets: Ticket[];
}

const DataExport: React.FC<DataExportProps> = ({ tickets }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<string>('ALL');

  const handleExport = () => {
    let dataToExport = tickets;
    
    if (filter !== 'ALL') {
      if (filter === 'BLOCKED') {
        dataToExport = tickets.filter(t => t.isBlocked);
      } else {
        dataToExport = tickets.filter(t => t.status === filter);
      }
    }

    const headers = ['ID', 'Key', 'Summary', 'Assignee', 'Status', 'Blocked', 'Age (Days)', 'Points'];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(t => [
        t.id,
        t.key,
        `"${t.summary.replace(/"/g, '""')}"`, // Escape quotes
        t.assignee,
        t.status,
        t.isBlocked ? 'TRUE' : 'FALSE',
        t.ageDays,
        t.points
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `stratos_telemetry_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          px-3 md:px-4 py-1 text-[9px] md:text-[10px] font-orbitron uppercase border transition-all duration-200
          ${isOpen 
            ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_#00f3ff]' 
            : 'bg-transparent text-cyan-500 border-cyan-900 hover:border-cyan-500 hover:bg-cyan-500/5'
          }
        `}
      >
        DATA EXPORT
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-transparent z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-48 glass-panel border border-cyan-500 p-3 z-50 flex flex-col gap-2 shadow-[0_0_30px_rgba(0,0,0,0.9)]">
            <h4 className="font-orbitron text-[10px] text-cyan-400 uppercase tracking-wider mb-1 border-b border-white/10 pb-1">
              Export Configuration
            </h4>
            
            <div className="flex flex-col gap-1">
              <label className="text-[8px] text-white/60 font-mono uppercase">Filter Data</label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="bg-black/60 border border-white/20 text-[10px] text-cyan-400 font-mono p-1 outline-none focus:border-cyan-500"
              >
                <option value="ALL">ALL TELEMETRY</option>
                <option value={TicketStatus.BACKLOG}>BACKLOG</option>
                <option value={TicketStatus.IN_PROGRESS}>IN PROGRESS</option>
                <option value={TicketStatus.QA_REVIEW}>QA REVIEW</option>
                <option value={TicketStatus.DONE}>DONE</option>
                <option value="BLOCKED">CRITICAL (BLOCKED)</option>
              </select>
            </div>

            <button 
              onClick={handleExport}
              className="mt-2 w-full py-1.5 bg-cyan-900/30 hover:bg-cyan-500 hover:text-black border border-cyan-500 text-cyan-400 text-[9px] font-orbitron font-bold uppercase tracking-widest transition-all duration-300"
            >
              Download .CSV
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DataExport;
