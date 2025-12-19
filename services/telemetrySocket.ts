
import { Ticket, TicketStatus } from '../types.ts';

type DataCallback = (data: Ticket[]) => void;
type LogCallback = (msg: string, type: 'info' | 'warn' | 'error') => void;
type StatsCallback = (stats: { ping: number; packetLoss: number; connected: boolean }) => void;

export class MockTelemetrySocket {
  private tickets: Ticket[];
  private isConnected: boolean = false;
  private subscribers: DataCallback[] = [];
  private logSubscribers: LogCallback[] = [];
  private statsSubscribers: StatsCallback[] = [];
  private loopId: any = null;
  
  // Simulation params
  private baseLatency = 120; // ms
  private jitter = 200; // ms
  private packetLossChance = 0.05; // 5%

  constructor(initialData: Ticket[]) {
    this.tickets = JSON.parse(JSON.stringify(initialData));
  }

  public connect() {
    if (this.isConnected) return;
    
    // Simulate connection delay
    setTimeout(() => {
      this.isConnected = true;
      this.broadcastLog("UPLINK ESTABLISHED. HANDSHAKE COMPLETE.", 'info');
      this.broadcastStats();
      this.startTelemetryLoop();
    }, 800);
  }

  public disconnect() {
    this.isConnected = false;
    this.broadcastLog("UPLINK SEVERED.", 'error');
    if (this.loopId) clearInterval(this.loopId);
    this.broadcastStats();
  }

  public onData(cb: DataCallback) { this.subscribers.push(cb); }
  public onLog(cb: LogCallback) { this.logSubscribers.push(cb); }
  public onStats(cb: StatsCallback) { this.statsSubscribers.push(cb); }

  private broadcastLog(msg: string, type: 'info' | 'warn' | 'error') {
    this.logSubscribers.forEach(cb => cb(msg, type));
  }

  private broadcastStats(pingOverride?: number) {
    const currentPing = pingOverride || (this.baseLatency + Math.random() * this.jitter);
    this.statsSubscribers.forEach(cb => cb({
      ping: Math.floor(currentPing),
      packetLoss: this.packetLossChance * 100,
      connected: this.isConnected
    }));
  }

  private startTelemetryLoop() {
    this.loopId = setInterval(() => {
      if (!this.isConnected) return;

      // Simulate Packet Loss
      if (Math.random() < this.packetLossChance) {
        this.broadcastLog("WARN: TELEMETRY PACKET DROPPED", 'warn');
        this.broadcastStats(999); // Spike ping on loss
        return; 
      }

      // Simulate Latency
      const latency = this.baseLatency + Math.random() * this.jitter;
      setTimeout(() => {
        this.mutateData();
        this.subscribers.forEach(cb => cb([...this.tickets]));
        this.broadcastStats(latency);
      }, latency);

    }, 3000); // Server ticks every 3s
  }

  private mutateData() {
    // Pick a random ticket to update
    const index = Math.floor(Math.random() * this.tickets.length);
    const ticket = this.tickets[index];
    const rand = Math.random();

    if (rand < 0.15) {
      // Toggle blockage
      ticket.isBlocked = !ticket.isBlocked;
      this.broadcastLog(
        `Unit ${ticket.key} ${ticket.isBlocked ? 'REPORTING MECHANICAL FAILURE' : 'CLEAR OF BLOCKAGE'}`, 
        ticket.isBlocked ? 'warn' : 'info'
      );
    } else if (rand < 0.35 && !ticket.isBlocked) {
      // Move ticket
      const statusFlow = [TicketStatus.BACKLOG, TicketStatus.IN_PROGRESS, TicketStatus.QA_REVIEW, TicketStatus.DONE];
      const currentIdx = statusFlow.indexOf(ticket.status);
      if (currentIdx < statusFlow.length - 1) {
        ticket.status = statusFlow[currentIdx + 1];
        this.broadcastLog(`Unit ${ticket.key} ADVANCING TO SECTOR ${ticket.status}`, 'info');
      }
    } else if (rand < 0.45) {
      // Age ticket
      ticket.ageDays++;
      if (ticket.ageDays > 10) {
        this.broadcastLog(`CRITICAL WEAR ON UNIT ${ticket.key}`, 'warn');
      }
    }
  }
}
