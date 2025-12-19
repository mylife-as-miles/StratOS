# StratOS: The Pit Wall 🏎️ 💨

> **"Code at 300km/h."**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-2.5.4-cyan.svg)
![Status](https://img.shields.io/badge/telemetry-LIVE-red.svg)

**StratOS** is a high-stakes, cyberpunk-themed engineering dashboard that transforms mundane Jira metrics into an F1 racing command center. It visualizes sprint velocity, ticket aging, and blockers as telemetry data, allowing engineering leads to make split-second strategic decisions.

---

## 📋 Table of Contents

- [Features](#-features)
- [Design Philosophy](#-design-philosophy)
- [Tech Stack](#-tech-stack)
- [Installation & Setup](#-installation--setup)
- [Data Architecture](#-data-architecture)
- [AI Integration](#-ai-integration)
- [Customization](#-customization)

---

## 🚀 Features

### 1. The Circuit (Sprint Visualization)
Instead of a Kanban board, tickets are represented as cars on a track.
- **Positioning:** Based on status (Backlog → In Progress → QA → Done).
- **Physics:** Cars "drift" and vibrate based on ticket age and blockages.
- **Sectors:** Visual grid segmentation representing the development lifecycle.

### 2. Live Telemetry
- **Fuel Gauge:** Represents Sprint Burndown. If fuel runs out before the finish line, the sprint fails.
- **Tyre Degradation:** Visualizes "Tech Debt" and "Ticket Age." Old tickets turn orange/red and emit smoke, indicating a risk of a blowout.
- **RPM/Velocity:** Real-time engineering throughput metrics.
- **Yellow Flags:** Immediate visual feedback when a blocker (`isBlocked: true`) occurs on the board.

### 3. AI Race Strategist (Powered by Gemini)
- Utilizes **Google Gemini 1.5 Pro/Flash** to analyze the current board state.
- Provides a **"Pit Strategy"**:
  - **CRITICAL:** Immediate intervention required.
  - **STABLE:** Maintain current velocity.
  - **OPTIMAL:** Push for stretch goals.
- Generates natural language recommendations (e.g., *"Box Box for blocking issue on ST-102"*).

### 4. Cyberpunk Aesthetics
- **Glassmorphism:** Frosted glass panels with neon borders.
- **Scanlines & Glitches:** CRT monitor effects for immersion.
- **Dark Mode Native:** Designed for low-light "Control Room" environments (`slate-950` / `cyan-500` palette).

---

## 🎨 Design Philosophy

Enterprise dashboards are usually boring. StratOS gamifies the SDLC (Software Development Life Cycle) to increase engagement.

| JIRA Concept | F1 Concept | Visual Representation |
| :--- | :--- | :--- |
| **Ticket Age** | **Tyre Wear** | Car color shifts (Magenta → Orange → Red), smoke effects. |
| **Blocker** | **Mechanical Failure** | Yellow flashing hazard lights, "Yellow Flag" warnings. |
| **Sprint Goal** | **Chequered Flag** | Crossing the finish line on the SVG track. |
| **Velocity** | **Lap Time/RPM** | Dynamic gauges and speedometers. |

---

## 💻 Tech Stack

- **Core Framework:** React 19 (ESM)
- **Styling:** Tailwind CSS (Runtime Configuration for portability)
- **Language:** TypeScript (Strict Mode)
- **Visualization:** Recharts (Gauges), Custom SVG (Track Map)
- **AI/LLM:** Google GenAI SDK (`@google/genai`)
- **Fonts:** Orbitron (Headers), Roboto Mono (Data)

---

## 🛠 Installation & Setup

### Prerequisites
- Node.js v18+
- A Google Cloud Project with the **Gemini API** enabled.

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/stratos-pit-wall.git
cd stratos-pit-wall
```

### 2. Environment Configuration
Create a `.env` file in the root directory. You must provide a valid Gemini API key.

```bash
# .env
API_KEY=AIzaSy...YourKeyHere
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
*Note: The application uses a Vite/ESM setup. Ensure your build pipeline supports Top-Level Await if modifying the AI service.*

---

## 🗄 Data Architecture

The application relies on strict TypeScript interfaces to ensure telemetry integrity.

### The Ticket Object
Represents a single unit of work (Jira Issue / GitHub Issue).

```typescript
interface Ticket {
  id: string;        // Unique UUID
  key: string;       // e.g., "ST-101"
  summary: string;   // Title
  assignee: string;  // Developer Name
  status: TicketStatus; // BACKLOG | IN_PROGRESS | QA_REVIEW | DONE
  isBlocked: boolean;   // Triggers Yellow Flag
  ageDays: number;      // Affects Tyre Wear
  points: number;       // Story Points
}
```

### The Race Telemetry
Calculated metrics derived from the aggregate state of all tickets.

```typescript
interface RaceTelemetry {
  fuelLevel: number;    // (Done Points / Total Points) %
  avgLapTime: number;   // Calculated Velocity
  drsEnabled: boolean;  // True if >2 tickets moved to Done in <1hr
  tyreWear: number;     // Avg Age of Active Tickets
  yellowFlags: number;  // Count of blocked tickets
}
```

---

## 🧠 AI Integration

StratOS uses the **Gemini 3 Flash** model for high-speed, low-latency analysis.

**Prompt Strategy:**
The system serializes the `Ticket[]` state into a JSON payload and injects it into a system prompt designed to act as a "Race Engineer."

**Response Schema:**
The AI returns a structured JSON object to ensure type safety in the UI.

```json
{
  "analysis": "Sector 2 is blocked. Lewis H. is struggling with the Database Migration.",
  "recommendations": [
    "Clear blockage on ST-102 immediately.",
    "Switch Oscar P. to defensive coding."
  ],
  "priorityLevel": "CRITICAL"
}
```

---

## 🔧 Customization

### Modifying the Track
The track path is defined in `constants.ts` as an SVG Path string (`TRACK_PATH`). To change the layout to a different circuit (e.g., Monaco or Silverstone), update the `d` attribute of the path.

### Status Mapping
Adjust `STATUS_PROGRESS_MAP` in `constants.ts` to map your custom ticket statuses to percentage positions on the track.

```typescript
export const STATUS_PROGRESS_MAP: Record<TicketStatus, number> = {
  [TicketStatus.BACKLOG]: 0.1,  // Start Line
  [TicketStatus.IN_PROGRESS]: 0.4, // Sector 1
  [TicketStatus.QA_REVIEW]: 0.75, // Sector 2
  [TicketStatus.DONE]: 0.95 // Finish Line
};
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with precision by the StratOS Engineering Team.</sub>
</div>
